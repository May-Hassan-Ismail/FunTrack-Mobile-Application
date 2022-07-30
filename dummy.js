<Text style = {styles.taskTitle}>Contribution Graph</Text>
<ContributionGraph
  values={[
    { date: fullDates[0], count: countComp[0] },
    { date: fullDates[1], count: countComp[1] },
    { date: fullDates[2], count: countComp[2] },
    { date: fullDates[3], count: countComp[3] },
    { date: fullDates[4], count: countComp[4] }]}
  endDate={new Date()}
  numDays={105}
  width={Dimensions.get("window").width*0.95}
  height={220}
  chartConfig={{
    backgroundColor: "white",
    backgroundGradientFrom: "white",
    backgroundGradientTo: "white",
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  }}
/>




/////// HomeScreen

<CalendarStrip
  scrollable
  style={{height:100, paddingTop: 20, paddingBottom: 10}}
  selectedDate={selectedDate}
  calendarColor={'white'}
  calendarHeaderStyle={{color: 'black'}}
  dateNumberStyle={{color: 'black'}}
  dateNameStyle={{color: 'black'}}
  daySelectionAnimation={{
      type: 'border',
      duration: 200,
      borderWidth: 1,
      borderHighlightColor: 'white',
    }}
  highlightDateContainerStyle={
    {backgroundColor:'#44CCFF', color: 'white',
    padding: 5.5,
    height:80,
    width:60,
    borderTopEndRadius: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40}
  }
  highlightDateNumberStyle={{
    color: 'white',
  }}
  highlightDateNameStyle={{
    color: 'white',
  }}
  highlightDateNumberContainerStyle={{
    backgroundColor: '#FF9999',
    borderRadius: 40,
    padding: 4,
    marginHorizontal: 10,
    minWidth: 30,
    minHeight: 30,
    margin:5,
  }}
  iconContainer={{flex: 0.1}}
  onDateSelected={onDateSelected}
/>
