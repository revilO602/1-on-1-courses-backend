// Takes an array of timeslots and check if there are any collisions

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const maximumBeforeWeekOverlap = convertToMinutes({
  weekDay : 'Sunday',
  startTime : '22:59'
})
const weekEnd = maximumBeforeWeekOverlap + 60

const timeslots = [
  {
    weekDay : 'Monday',
    startTime : '14:56'
  },
  {
    weekDay : 'Monday',
    startTime : '15:00'
  },
  {
    weekDay : 'Sunday',
    startTime : '23:57'
  },
  {
    weekDay : 'Monday',
    startTime : '00:20'
  },
]

function convertToMinutes(timeslot){
  const timeParts = timeslot.startTime.split(":");
  return (parseInt(timeParts[0],10) * 60) + parseInt(timeParts[1],10) + (days.indexOf(timeslot.weekDay) * 24*60);
}

function isOverlap(start1, start2){
  console.log(start1 + ' ' + start2)
  if(start2 > maximumBeforeWeekOverlap){
    let end2 = start2 + 60 - weekEnd
    return (start1 < end2)
  }
  return ( (start1+60) > start2 )
}

function areCollisions(timeslots){
  for (let i=0; i < timeslots.length-1; i++){
    for (let j=i+1; j < timeslots.length; j++){
      let converted = [convertToMinutes(timeslots[i]), convertToMinutes(timeslots[j])]
      let sorted = ( converted[0] < converted[1]) ? [converted[0], converted[1]] : [converted[1], converted[0]]
      console.log(isOverlap(sorted[0],sorted[1]))
    }
  }
}

areCollisions(timeslots)
