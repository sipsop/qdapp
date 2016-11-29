import React from 'react'
import {
  View,
  Text,
  Platform,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import {
    PureComponent,
    T,
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { computed } from 'mobx'
import Modal from 'react-native-modalbox'
import Calendar from 'react-native-calendar'
import DatePicker from 'react-native-datepicker'
import moment from 'moment'

import { barStore, timeStore, modalStore } from '/model/store'
import { Time } from '/components/Time'
import { PINK_COLOR } from '/utils/appstyles/appColors'

const styles = {
    modalContainer: {
        width: Dimensions.get('window').width,
        height: Platform.OS === 'ios' ? 540 : 425,
    },
    header: {
        textAlign: 'center',
        fontSize: 18,
        padding: 18,
        fontWeight: 'bold',
        color: PINK_COLOR
    },
    subheading: {
        textAlign: 'center',
        fontSize: 15,
        padding: 10,
        fontWeight: 'bold',
        color: PINK_COLOR
    },
    day: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 5
    },
    dayTextStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
    timeText: {
        fontWeight: 'bold'
    },
    openingTime: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 13,
        height: 50
    },
    row: {
        flexDirection: 'row'
    },
    seperator: {
        backgroundColor: '#f2f2f2',
        height: 1,
        marginRight: 15,
        marginLeft: 15
    },
    date: {
        fontSize: 17,
        fontWeight: 'bold',
        color: PINK_COLOR,
    },
    bookingRowStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    btn: {
        height: 50,
        backgroundColor: PINK_COLOR,
        alignItems: 'center',
        flex: 1,
    },
    btnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        padding: 13,
    },
    btnrow: {
        flexDirection: 'row',
    },
    timePicker: {
        width: 200,
        borderColor: '#f2f2f2',
    },
    peopleinput: {
        width: 200,
        height: 38,
        borderWidth: 1,
        borderColor: '#f2f2f2',
        textAlign: 'center'
    },
    cfcontainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    text: {
        color: '#696969',
        fontSize: 15,
        fontWeight: 'bold',
        padding: 14,
    },
    confirmViewBtn1: {
        height: 40,
        backgroundColor: '#fff',
        borderColor: PINK_COLOR,
        borderWidth: 2,
        alignItems: 'center',
        borderRadius: 20,
        width: 200,
    },
    confirmViewBtn1Text: {
        color: '#000',
        fontSize: 13,
        fontWeight: 'bold',
        padding: 10,
    },
    refInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#f2f2f2',
        textAlign: 'center',
        padding: 20,
        fontSize: 14,
    },
}

const calendarStyles = {
    calendarContainer: {
        backgroundColor: '#fff',
    },
    selectedDayCircle: {
        backgroundColor: PINK_COLOR,
    },
    currentDayCircle: {
        backgroundColor: PINK_COLOR,
    },
    currentDayText: {
        color: PINK_COLOR,
    },
}

@observer
export class RequestBookingModal extends PureComponent {

    constructor (props) {
        super(props)
        this.state = {
            date: moment().format('MMM Do YY'),
            time: '20:00',
            amount: 2,
            showConfirmView: false,
            showBookingView: false,
            showView: 0,
            refId: 0,
        }
    }

    onDateChange = (date) => {
        const newDate = moment(date).format('MMM Do YY')
        this.setState({ date: newDate })
    }
    onTimeChange = (time) => {
        this.setState({ time })
    }
    showConfirmView = () => {
        this.setState({ showView: 2 })
    }
    showBookingView = () => {
        this.setState({ showView: 1 })
    }
    onClose = () => {
        modalStore.closeBookingRequestModal()
        this.setState({ showView: 0 })
    }

// {this.state.date.toLocaleDateString('en-US')}
    render = () => {
        const bar = barStore.getBar()
        const optionView = () => {
            return (
              <ScrollView contentContainerStyle={styles.cfcontainer}>
                <View>
                  <Text style={styles.header}>Book or join a table</Text>
                  <View style={styles.seperator} />
                </View>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.text}>Enter a table reference ID</Text>
                  <TextInput style={styles.refInput}
                      keyboardType="numeric"
                      onChangeText={(refId) => this.setState({refId})}
                      returnKeyType="done"
                      placeholder="Table reference ID"
                    />
                  <View style={{alignItems: 'center', padding: 14}}>
                      <TouchableOpacity style={styles.confirmViewBtn1}>
                        <Text style={styles.confirmViewBtn1Text}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                        <ActivityIndicator size="large" animating />
                    </View>
                </View>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.text}>Book a table yourself</Text>
                    <View style={{alignItems: 'center', padding: 14}}>
                      <TouchableOpacity style={styles.confirmViewBtn1}
                        onPress={() => this.showBookingView()}
                      >
                        <Text style={styles.confirmViewBtn1Text}>Book a table</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.btnrow}>
                  <TouchableOpacity style={styles.btn}
                    onPress={() => this.onClose()}
                    >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )
        }

        const bookingView = () => {
            return (
                <ScrollView>
                  <Text style={styles.header}>Table Booking</Text>
                  <View style={styles.seperator} />
                  <View>
                    <Calendar
                        scrollEnabled
                        titleFormat={'MMMM YYYY'}
                        showControls
                        prevButtonText={'Prev'}
                        nextButtonText={'Next'}
                        customStyle={calendarStyles}
                        onDateSelect={(date) => this.onDateChange(date)} // eslint-disable-line
                     />
                     <View style={styles.seperator} />
                       <View style={styles.bookingRowStats}>
                         <Text style={styles.date}>Time</Text>
                           <DatePicker
                               style={{width: 200}}
                               date={this.state.time}
                               mode="time"
                               format="HH:mm"
                               confirmBtnText="Confirm"
                               cancelBtnText="Cancel"
                               minuteInterval={30}
                               onDateChange={(time) => this.onTimeChange(time)}
                           />
                      </View>
                       <View style={styles.bookingRowStats}>
                         <Text style={styles.date}>People</Text>
                         <TextInput style={styles.peopleinput}
                             keyboardType="numeric"
                             onChangeText={(amount) => this.setState({amount})}
                             returnKeyType="done"
                             placeholder="2"
                          />
                      </View>
                      <View style={styles.btnrow}>
                        <TouchableOpacity style={styles.btn}
                          onPress={() => this.onClose()}
                          >
                          <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={() => this.showConfirmView()}>
                          <Text style={styles.btnText}>Confirm</Text>
                        </TouchableOpacity>
                      </View>
                  </View>
                </ScrollView>
            )
        }
        const confirmView = () => {
            return (
              <View style={styles.cfcontainer}>
                <View>
                  <Text style={[styles.header]}>{bar.name}</Text>
                  <View style={styles.seperator} />
                  <Text style={styles.subheading}>Confirm your reservation request</Text>
                </View>
                  <View style={styles.bookingRowStats}>
                      <Text style={styles.date}>Date:</Text>
                      <Text style={styles.date}>{this.state.date}</Text>
                  </View>
                  <View style={styles.bookingRowStats}>
                      <Text style={styles.date}>Time:</Text>
                      <Text style={styles.date}>{this.state.time}</Text>
                  </View>
                  <View style={styles.bookingRowStats}>
                      <Text style={styles.date}>Amount of people: </Text>
                      <Text style={styles.date}>{this.state.amount}</Text>
                  </View>
                  <View>
                      <Text style={styles.text}>
                         A reservation request will be sent to {bar.name}. You will receive a notification once they
                         accept your reservation. Your reservation will be listed in the side menu under My Bookings.
                      </Text>
                  </View>
                  <View>
                      <ActivityIndicator size="large" animating />
                  </View>
                  <View style={styles.btnrow}>
                    <TouchableOpacity style={styles.btn} onPress={() => this.showBookingView()}>
                      <Text style={styles.btnText}>Go back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn}>
                      <Text style={styles.btnText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
              </View>
            )
        }
        const showView = () => {
            if (this.state.showView === 0) {
                return optionView()
            }
            if (this.state.showView === 1) {
                return bookingView()
            }
            if (this.state.showView === 2) {
                return confirmView()
            }
        }
        console.log(this.state.showView)
        return (
          <Modal style={styles.modalContainer} onClosed={this.props.onClosedProp} isOpen={this.props.isVisible} position="bottom">
              {showView()}
          </Modal>
        )
    }
}
