import React, {useState} from 'react';

import {useHistory} from 'react-router-dom';
import moment from 'moment';
import {Checkbox} from 'semantic-ui-react';

import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';

export function DeleteAvailabilityScreen(props) {
    const history = useHistory();

    const [user, setUser] = useState(undefined)

    const [deleteSeries, setDeleteSeries] = useState(false);

    const onClickDelete = async () => {
        // TODO loading stuff ...
        const successHandler = (result) => {
            history.push({
                pathname: "/my-calendar",
                state: {
                    selectedDate: availability.startDate
                }
            });
        };

        if (deleteSeries) {
            const call = apiFactory.makeDeleteAvailabilitySeries({
                availabilitySeriesId: availability.availabilitySeries,
                user: user,
                successHandler: successHandler,
            });
            call();
        } else {
            const call = apiFactory.makeDeleteAvailability({
                availabilityId: availability.id,
                user: user,
                successHandler: successHandler,
            });
            call();
        }
    };

    const onCancel = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: availability.startDate
            }
        });
    };

    const stateProps = props.location.state;
    if (!stateProps || !stateProps.availability) {
        return <h2>Whoops, no availability provided</h2>
    }
    const availability = stateProps.availability;

    return (
        <BaseScreen
            titleText={"View Availability"}
            needAuthenticated={true}
            setUser={setUser}>

            <table className="AvailabilityForm">
                <tr>
                    <AvailabilityPiece
                        header={"Subjects:"}
                        content={availability.subjects}
                    />
                </tr>
                <tr>
                    <AvailabilityPiece
                        header={"Start Time:"}
                        content={moment(availability.startTime).format('MMMM Do YYYY, h:mm:ss a')}
                    />
                </tr>
                <tr>
                    <AvailabilityPiece
                        header={"End Time:"}
                        content={moment(availability.endTime).format('MMMM Do YYYY, h:mm:ss a')}
                    />
                </tr>
                <tr>
                    <td>
                        <button onClick={onClickDelete}>
                            Delete
                        </button>
                    </td>
                    <td>
                        <button onClick={onCancel}>
                            Cancel
                        </button>
                    </td>
                </tr>
                {
                    availability.availabilitySeries ?
                        <tr>
                            <Checkbox style={{'marginRight': '0px'}} label={"Delete series?"} onChange={() => setDeleteSeries(!deleteSeries)}/>
                        </tr>
                    :
                        <>
                        </>
                }
            </table>

        </BaseScreen>
    );
}

function AvailabilityPiece(props) {
    return (
        <>
            <td>
                {props.header}
            </td>
            <td>
                {props.content}
            </td>
        </>
    );
}
