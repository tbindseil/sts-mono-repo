import React, {useCallback, useEffect, useState} from 'react';

import moment from 'moment';
import {useHistory} from 'react-router-dom';

import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';

// TODO cool idea, allow start time and subject to be selectable here
export function SelectAvailabilityScreen(props) {
    const history = useHistory();

    const stateProps = props.location.state;

    // if there are no state props, we in trouble..
    const startTime = stateProps.startTime;
    const subject = stateProps.subject;

    const [user, setUser] = useState(undefined)

    const [availabilities, setAvailabilities] = useState(new Map());
    const [statuses, setStatuses] = useState(new Map());
    const updateStatus = useCallback(
        (id, status) => {
            const currStatus = statuses.get(id);
            if (currStatus === status) {
                // base case
                return;
            }
            statuses.set(id, status);
            const newStatuses = new Map(statuses);
            setStatuses(newStatuses);
        },
        [statuses, setStatuses]
    );


    // TODO need to ignore own users availabilities
    // maybe I also need to consider that the user shouldn't be able to make requests while they have availabilities
    const getAvailabilities = useCallback(
        (user) => {
            if (!user) {
                return;
            }

            // TODO need to show time slot, all the more reason to make it searchable here too

            const successHandler = (result) => {
                const availabilitiesWithDates = new Map();
                for (const [id, avail] of Object.entries(result)) {
                    availabilitiesWithDates.set(id, {
                        id: id,
                        endTime: moment.utc(avail.endTime).local().toDate(),
                        startTime: moment.utc(avail.startTime).local().toDate(),
                        subjects: avail.subjects,
                        tutor: avail.tutor,
                    });
                }
                setAvailabilities(availabilitiesWithDates);
            };

            // TODO, use ...errorProps here, then maybe even roll them into a component
            // gonna put this in a new folder (named ?? base-components)
            // I should move header and footer there
            const endTime = moment(startTime).add('minute', 30).toDate();
            const call = apiFactory.makeGetAvailabilities({
                user: user,
                username: "*",
                subject: subject,
                startTime: startTime,
                endTime: endTime,
                successHandler: successHandler
            });
            call();
        },
        [startTime, subject]
    );

    const getStatuses = useCallback(
        (availabilities) => {
            if (!user) {
                return;
            }

            const successHandler = (result) => {
                const id = result.id.toString();
                const status = result.status;

                updateStatus(id, status);
            };

            availabilities.forEach(avail => {
                const call = apiFactory.makeGetAvailabilityStatus({
                    availId: avail.id,
                    user: user,
                    successHandler: successHandler
                });
                call();
            });
        },
        [user, updateStatus]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    useEffect(() => {
        getStatuses(availabilities);
    }, [
        availabilities, getStatuses
    ]);

    const onCancel = () => {
        history.push({
            pathname: "/calendar",
            state: {
                selectedDate: startTime
            }
        });
    };

    const onSendRequest = (event) => {
        const availId = event.target.getAttribute("data");

        const successHandler = (result) => {
            getStatuses(availabilities);
        };

        const call = apiFactory.makePostRequestStatusCall({user: user,
            availId: availId,
            username: user.username,
            successHandler: successHandler
        });
        call();
    };

    const onCancelRequest = (event) => {
        const forAvailability = event.target.getAttribute("data");
        const newStatus = 'CANCELED';

        const successHandler = (result) => {
            getStatuses(availabilities);
        };

        const call = apiFactory.makeUpdateRequestStatus({
            user: user,
            fromUser: user.username,
            forAvailability: forAvailability,
            newStatus: newStatus,
            successHandler: successHandler
        });
        call();
    };

    const makeRequestAvailabilityButton = (availability) => {
        // possible avail statuses :
        // OPEN
        // REQEUSTED
        // CLOSED
        // ACCEPTED
        // DENIED

        // more TODO
        // does UI need to know if user has already sent a request that woudl conflict?
        // naw, backend babyy
        // and just say, can't make another request when you have an overlapping accepted request
        // this might need a state diagram tho

        let text;
        let onClickHandler;
        const status = statuses.get(availability.id);
        switch(status) {
            case "OPEN":
                text = "Request";
                onClickHandler = onSendRequest;
                break;
            case "REQUESTED":
            case "ACCEPTED":
                text = "Cancel";
                onClickHandler = onCancelRequest;
                break;
            case "DENIED":
                text = "Not Requestable";
                onClickHandler = () => {};
                break;
            default:
                // TODO
                // so this is kinda fucked
                // and is basically what I was ranting about when starting this whole piece of work
                // and the solution I have is to not show the avails until their statuses are calced
                // then just not showing the ones that are CLOSED (requested and accepted for another tutor
                text = "Not Requestable";
                onClickHandler = () => {};
                break;
        }

        return (
            <button onClick={onClickHandler} data={availability.id}>
                {text}
            </button>
        );
    };

    return (
        <BaseScreen
            titleText={"Select Availability"}
            needAuthenticated={true}
            setUser={setUser}>

            <table className="AvailabilityForm">

                <tr>
                    <th>
                        Start
                    </th>
                    <th>
                        End
                    </th>
                    <th>
                        Tutor
                    </th>
                    <th>
                        Subjects
                    </th>
                    <th>
                        Status
                    </th>
                    <th>
                        Button
                    </th>
                </tr>

                {
                    Array.from(availabilities.entries()).map(availEntry => {
                        const status = statuses.get(availEntry[0]);
                        return (
                            <tr>
                                <td>
                                    {moment(availEntry[1].startTime).format("LT")}
                                </td>
                                <td>
                                    {moment(availEntry[1].endTime).format("LT")}
                                </td>
                                <td>
                                    {availEntry[1].tutor}
                                </td>
                                <td>
                                    {availEntry[1].subjects}
                                </td>
                                <td>
                                    {
                                            (status
                                        ?
                                            status
                                        :
                                            'loading')
                                    }
                                </td>
                                <td>
                                    {
                                        makeRequestAvailabilityButton(availEntry[1])
                                    }
                                </td>
                            </tr>
                        );
                    })
                }

                <tr>
                    <td>
                        <button onClick={onCancel}>
                            Cancel
                        </button>
                    </td>
                    <td>
                        paragraph
                    </td>
                </tr>
            </table>

        </BaseScreen>
    );
}
