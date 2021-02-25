/*
 * given a list a and a start day availabilities, return ..
 * day -> list_of_stipes [
 *      numsegments,
 *      colors - for now red for on, blue for off
 */

const OFF_COLOR = "blue";
const ON_COLOR = "red";

export function visitAvailabilties(availabilities, initialDate, finalDate) {
    /*var stripes = [];

    var currDate = initialDate;
    availabilities.forEach(availability => {
        // take difference between curr date and start of avail
        // turn that into how many 15 minute segments
        const segmentsUntilStartOfAvailability = (availability.startTime - currDate) / (15 * 60 * 1000);

        // if 0 don't add, could be back to back or butting up to start of month
        if (segmentsUntilStartOfAvailability !== 0) {
            stripes.append({
                numSegments: segmentsUntilStartOfAvailability,
                bgColor: OFF_COLOR
            })
        }

        // take difference between start and end of avail
        // turn that into how mnay 15 minute segments
        const segmentsOfAvailability = (availability.endTime - availability.startTime) / (15 * 60 * 1000);

        // rules, always round "out" for 15 minute segment of availability, not off time
        if (availability.endTime % (15 * 60 * 1000) === 0) {
            segmentsOfAvailability++;
        }
        
        if (availability.startTime % (15 * 60 * 1000) === 0) {
            segmentsOfAvailability++;
        }

        stripes.append({
            numsegments: segmentsOfAvailability,
            bgColor: ON_COLOR
        });

        // currDate = end Date of avail
        currDate = availability.endTime;
    });

    // TODO from end of last avail to end of last date, need new param

    console.log("stripes is:");
    console.log(stripes);

    var currDay = initialDate - (initialDate % (24 * 60 * 60 * 1000));
    var daysToStripes = {};
    stripes.forEach(stripe => {       
        daysToStripes[currDay.toString()] = {
            stripes: []
        };
        // if stripe breaks 24
        //    break stripe
        //    grab first half of stripe
        //    make new day
        //    grab second half of stripe
        // else
        //    grab stripe
    });

    return stripes;*/


    /*
     * maybe there is a better way:
     *  for each segment
     *      for each avail
     *          add its color to segments list if it overlaps
     *          if end of segment > end of avail, avail = next_avail
     *      
     *
     *
     *
     *
     *  except not quite....   I think I could just tie these segments to avail (command cough cough) then the whole becomes easy because I can resize the width of an availrectangle, and it is the way to know when to reset. the maximum colors for any given rectangle's span is the divisor in how much width it takes up, (rather than once we reach 0 colors for a segment). But, for now I'm not worried about this since I'm just trying to get one gd avail to show up
     *  based off the number of colors a segment can have, we can tell how wide things are?
     *  
     *  starting at a segment with colors > 0
     *  iterate over segments while tracking max number of colors
     *  stop iterating when colors == 0
     *  all avails in that section have that width
     */
    /*const total = 24 * 4;
    const pixelsPerSegment = 2;

    const 15_minutes = 15 * 60 * 1000;
    var currSegStart = initialDate - (initialDate % (15 * 60 * 1000));
    var currSegEnd = currSegStart + 15 * 60 * 1000;

    segments = [];
    for (var i = 0; i < total * pixelsPerSegment; i++) {
        availabilities.forEach(avail => {
            if (avail.startDate 
        });
        currSegStart += 15_minutes;
    }*/
}
