import React from 'react';
import {
  Platform,
  Text,
  View,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';

// Import all locales
import AsyncStorage from '@react-native-community/async-storage';
import OneSignal from 'react-native-onesignal';
import { Avatar } from 'react-native-elements';
import I18n from '../../utils/i18n';
import styles from './style';
// import {GameballWidget} from 'react-native-gameball';
// import {GameballSdk} from 'react-native-gameball';

const deviceHeight = Dimensions.get('screen').height;
const deviceWidth = Dimensions.get('screen').width;
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
const monthNamesAr = [
  'يناير',
  'فبراير',
  'مارس',
  'ابريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'اكتوبر',
  'نوفمبر',
  'ديسمبر'
];
export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),
      modalVisible: false,
      deep: false,
      cardData: '',
      Home:'1',
      user_id:'',
      cashData:'',
      paymentData:''
    };
    // GameballWidget.init('f02e7fca136d4b3fb018a5a3199066aa', 'en')
    OneSignal.init("e8b347ba-ca2e-468c-905b-de70517af0f2");
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.configure();
  }
  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
  }
  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }
  onIds(device) {
    // alert(12);
    console.log('one signal check: '+ JSON.stringify(123));
    console.log('Device info: ', device);
  }
  onReceived(notification) {
    console.log('Notification received: ', notification);
  }
  onOpened(openResult) {
  }
  componentDidMount() {
    const { navigation } = this.props;
    AsyncStorage.getItem('userid', (err, userID) => {
      this.setState({ user_id: JSON.parse(userID) });
    });
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 500
    }).start();
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('closed deep link : '+ url);
        this._handleOpenURL(url);
      }
    }).catch(err => console.error('An error occurred', err));
    this.focusListener = navigation.addListener('didFocus', () => {
      this.setState({ cardData: '' });
      this.pay_card_loop();
      Linking.addEventListener('url', this._handleOpenURL);
    });
  }
  componentWillUnmount(){
    this.focusListener.remove();
    Linking.removeEventListener('url', this._handleOpenURL);
  }
  stop_spinner() {
    setTimeout(() => {
      this.setState({ modalVisible: false });
    }, 500);
  }
  pay_card_loop = () => {
    // this.setState({ modalVisible: true });
    AsyncStorage.getItem('session', (err, result) => {
      const config = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${result}`
        }
      };
      fetch('http://elgameya.net/api/get/cashout/data', config)
        .then(response => response.json())
        .then(responseJson => {
          this.stop_spinner();
          setTimeout(() => {
            this.setState({ cardData: responseJson.members, paymentData: responseJson.payment });
          }, 300);
        })
        .catch(err => {
          this.stop_spinner();
          // alert(err);
        });
    });
  }
  handle_payConfirm = (Data,Data2,Data3,Data4,Data5,Data6,Data7) => {
    this.props.navigation.navigate('ConfirmPay',{
      month:Data,
      fullName:Data2,
      amount:Data3,
      cycleID:Data4,
      Home:1,
      profile:Data5,
      GateWay:Data6,
      wallet:Data7
    });
  }
  handle_Details = Data => {
    this.props.navigation.navigate('CycleDetails', { cycle_id: Data, Home: this.state.Home })
  };
  handle_payCard = () =>{
    let card_pay_array = [];
    let cards = this.state.cardData;
    let payments = this.state.paymentData;
    let current_date  = new Date();
    let current_month = current_date.getMonth();
    let current_day   = current_date.getDate();
    let days_remain;
    if(current_day  == 31){
      switch (current_day) {
        case 27:
          days_remain = '06';
          break;
        case 28:
          days_remain = '05';
          break;
        case 29:
          days_remain = '04';
          break;
        case 30:
          days_remain = '03';
          break;
        case 31:
          days_remain = '02';
          break;
        case 1:
          days_remain = '01';
          break;
        case 2:
          days_remain = '00';
          break;
      }
    }else{
      switch (current_day) {
        case 27:
          days_remain = '06';
          break;
        case 28:
          days_remain = '05';
          break;
        case 29:
          days_remain = '04';
          break;
        case 30:
          days_remain = '03';
          break;
        case 1:
          days_remain = '02';
          break;
        case 2:
          days_remain = '01';
          break;
        case 3:
          days_remain = '00';
          break;
      }
    }
    // let monthCondition = 1;
    if(current_day < 27){
      monthCondition = current_month + 1
    }else if(current_day >= 27){
      monthCondition = current_month + 2;
    }
    if(monthCondition > 12){
      monthCondition = 1;
    }
    for(let s =0; s < cards.length; s++){
      if(cards[s].collect_month == monthCondition  && cards[s].user_id !== this.state.user_id){
        let amount_per_month  = cards[s].cycle.amount_per_month;
        let full_name         = cards[s].user.full_name;
        let wallet            = cards[s].user.wallet;
        let profile_photo     = cards[s].user.photo;
        let IDS               = cards[s].cycle_id;
        let month             = cards[s].collect_month;
        let cardInfo          = cards[s].cycle.payment;
        // let cardInfo          = payments;
        let payment_others = 0;
        if(cardInfo.length > 0){
          for(m = 0; m < cardInfo.length; m++){
            let Gate  = cardInfo[m].gateway;
            let userpaid      = cardInfo[m].user_id;
            let monthpaid     = cardInfo[m].month;
            if(this.state.user_id == userpaid){
              if(monthpaid == monthCondition && cardInfo[m].status == 0){
                // if(cardInfo[m].user_id == this.state.user_id){
                    card_pay_array.push(
                      <View
                          key={s}
                          style={styles.payCard}>
                          <View style={styles.PayCardSecondView}>
                            {current_day >= 27 || current_day <= 3 ?
                              <View style={styles.remaining}>
                                <Text style={styles.days}>{I18n.t('Days')}</Text>
                                <Text style={styles.daysNo}>{days_remain}</Text>
                                <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                              </View>
                            :
                              <View style={styles.remaining}>
                                <Text style={styles.days}>{I18n.t('Days')}</Text>
                                <Text style={styles.daysNo}>00</Text>
                                <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                              </View>
                            }
                            <View style={styles.remainingSecondView}>
                              {I18n.locale == 'ar' ?
                              <View style={{width:'100%'}}>
                                <View style={{width:220}}>
                                  <Text style={styles.secondPayMonthAr}>  {I18n.t('Instalment')}<Text style={styles.payMonthAr}> {monthNamesAr[monthCondition-1]}</Text> </Text>
                                </View>
                              </View>
                              :
                              <View style={{width:'100%'}}>
                                <View style={{width:220}}>
                                  <Text style={styles.payMonth}> {monthNames[monthCondition-1]}  <Text style={styles.secondPayMonth}> {I18n.t('Instalment')}</Text> </Text>
                                </View>
                              </View>
                              }
                              <View style={styles.payFor}>
                                  <Image 
                                    style={styles.infoIcon}
                                    source={require('../../assets/information_button_2.png')}></Image>
                                  <View style={styles.payForContainer}>
                                    <View style={styles.payForFirstView}>
                                      {profile_photo == null ?
                                      <Image 
                                      style={styles.Avatar}
                                      source={require('../../assets/user.png')}></Image>
                                      :
                                      <Image 
                                      style={styles.Avatar}
                                      source={{ uri: profile_photo}}></Image>
                                      }
                                    </View>
                                    {I18n.locale == 'ar' ?
                                    <View style={styles.payForSecondView}>
                                      <Text style={styles.payForTextAr}>{I18n.t('waitingTransaction')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                                      <Text style={styles.payForTextAr}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                                    </View>
                                    :
                                    <View style={styles.payForSecondView}>
                                      <Text style={styles.payForText}>{I18n.t('waitingTransaction')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                                      <Text style={styles.payForText}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                                    </View>
                                    }
                                  </View>
                              </View>
                            </View>
                          </View>
                          <View style={styles.payCardButtons}>
                            <TouchableOpacity onPress={()=> this.handle_Details(IDS) } style={styles.payDetailsButton}>
                              <Text style={styles.payDetailsText}>{I18n.t('Cycle details')}</Text>
                            </TouchableOpacity>
                            <View style={styles.payNwButton}>
                              <Text style={styles.payNwText}>{I18n.t('Pending')}</Text>
                            </View>
                          </View>
                    </View>);
                      break;
              }else if(monthpaid == monthCondition && cardInfo[m].status == "pending"){
                card_pay_array.push(
                  <View
                      key={s}
                      style={styles.payCard}>
                      <View style={styles.PayCardSecondView}>
                        {current_day >= 27 || current_day <= 3 ?
                        <View style={styles.remaining}>
                          <Text style={styles.days}>{I18n.t('Days')}</Text>
                          <Text style={styles.daysNo}>{days_remain}</Text>
                          <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                        </View>
                        :
                        <View style={styles.remaining}>
                          <Text style={styles.days}>{I18n.t('Days')}</Text>
                          <Text style={styles.daysNo}>00</Text>
                          <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                        </View>
                        }
                        <View style={styles.remainingSecondView}>
                          {I18n.locale == 'ar' ?
                          <View style={{width:'100%'}}>
                              <View style={{width:220}}>
                                <Text style={styles.secondPayMonthAr}>{I18n.t('Instalment')}<Text style={styles.payMonthAr}> {monthNamesAr[monthCondition-1]}</Text> </Text>
                              </View>
                          </View>
                          :
                          <View>
                              <View style={{width:220}}>
                                <Text style={styles.payMonth}>{monthNames[monthCondition-1]} <Text style={styles.secondPayMonth}> {I18n.t('Instalment')}</Text> </Text>
                              </View>
                          </View>
                          }
                          <View style={styles.payFor}>
                              <Image 
                                style={styles.infoIcon}
                                source={require('../../assets/information_button_2.png')}></Image>
                              <View style={styles.payForContainer}>
                                <View style={styles.payForFirstView}>
                                {profile_photo == null ?
                                  <Image 
                                  style={styles.Avatar}
                                  source={require('../../assets/user.png')}></Image>
                                  :
                                  <Image 
                                  style={styles.Avatar}
                                  source={{ uri: profile_photo}}></Image>
                                  }
                                </View>
                                {I18n.locale == 'ar' ?
                                <View style={styles.payForSecondView}>
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={styles.payForTextAr}>{I18n.t('You will pay')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} إلى </Text>
                                  :
                                  <Text style={styles.payForTextAr}>{I18n.t('Due Payment')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                                  }
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={[styles.payForText,{fontWeight:'bold',marginRight:'auto'}]}>{cards[s].user.full_name} </Text>
                                  :
                                  <Text style={styles.payForTextAr}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                                  }
                                </View>
                                :
                                <View style={styles.payForSecondView}>
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={styles.payForText}>{I18n.t('You will pay')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} To </Text>
                                  :
                                  <Text style={styles.payForText}>{I18n.t('Due Payment')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                                  }
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={[styles.payForText,{fontWeight:'bold'}]}>{cards[s].user.full_name} </Text>
                                  :
                                  <Text style={styles.payForText}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                                  }
                                </View>
                                }
                              </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.payCardButtons}>
                        <TouchableOpacity onPress={()=> this.handle_Details(IDS) } style={styles.payDetailsButton}>
                          <Text style={styles.payDetailsText}>{I18n.t('Cycle details')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=> this.handle_payConfirm(month,full_name,amount_per_month,IDS,profile_photo,'new',wallet)}  style={styles.payNwButton}>
                          <Text style={styles.payNwText}>{I18n.t('Pay Now')}</Text>
                        </TouchableOpacity>
                      </View>
                  </View>
                );
                break;
              }else if(monthpaid == monthCondition && cardInfo[m].status == 1){
                break;
              }
            }else{
              if(monthCondition == monthpaid && m == cardInfo.length-1){
                card_pay_array.push(
                  <View
                      key={s}
                      style={styles.payCard}>
                      <View style={styles.PayCardSecondView}>
                        {current_day >= 27 || current_day <= 3 ?
                        <View style={styles.remaining}>
                          <Text style={styles.days}>{I18n.t('Days')}</Text>
                          <Text style={styles.daysNo}>{days_remain}</Text>
                          <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                        </View>
                        :
                        <View style={styles.remaining}>
                          <Text style={styles.days}>{I18n.t('Days')}</Text>
                          <Text style={styles.daysNo}>00</Text>
                          <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                        </View>
                        }
                        <View style={styles.remainingSecondView}>
                          {I18n.locale == 'ar' ?
                          <View style={{width:'100%'}}>
                              <View style={{width:220}}>
                                <Text style={styles.secondPayMonthAr}>{I18n.t('Instalment')}<Text style={styles.payMonthAr}> {monthNamesAr[monthCondition-1]}</Text> </Text>
                              </View>
                          </View>
                          :
                          <View>
                              <View style={{width:220}}>
                                <Text style={styles.payMonth}>{monthNames[monthCondition-1]} <Text style={styles.secondPayMonth}> {I18n.t('Instalment')}</Text> </Text>
                              </View>
                          </View>
                          }
                          <View style={styles.payFor}>
                              <Image 
                                style={styles.infoIcon}
                                source={require('../../assets/information_button_2.png')}></Image>
                              <View style={styles.payForContainer}>
                                <View style={styles.payForFirstView}>
                                {profile_photo == null ?
                                  <Image 
                                  style={styles.Avatar}
                                  source={require('../../assets/user.png')}></Image>
                                  :
                                  <Image 
                                  style={styles.Avatar}
                                  source={{ uri: profile_photo}}></Image>
                                  }
                                </View>
                                {I18n.locale == 'ar' ?
                                <View style={styles.payForSecondView}>
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={styles.payForTextAr}>{I18n.t('You will pay')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} إلى </Text>
                                  :
                                  <Text style={styles.payForTextAr}>{I18n.t('Due Payment')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                                  }
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={[styles.payForText,{fontWeight:'bold',marginRight:'auto'}]}>{cards[s].user.full_name} </Text>
                                  :
                                  <Text style={styles.payForTextAr}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                                  }
                                </View>
                                :
                                <View style={styles.payForSecondView}>
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={styles.payForText}>{I18n.t('You will pay')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} To </Text>
                                  :
                                  <Text style={styles.payForText}>{I18n.t('Due Payment')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                                  }
                                  {current_day >= 27 || current_day <= 3 ?
                                  <Text style={[styles.payForText,{fontWeight:'bold'}]}>{cards[s].user.full_name} </Text>
                                  :
                                  <Text style={styles.payForText}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                                  }
                                </View>
                                }
                              </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.payCardButtons}>
                        <TouchableOpacity onPress={()=> this.handle_Details(IDS) } style={styles.payDetailsButton}>
                          <Text style={styles.payDetailsText}>{I18n.t('Cycle details')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=> this.handle_payConfirm(month,full_name,amount_per_month,IDS,profile_photo,'new',wallet)}  style={styles.payNwButton}>
                          <Text style={styles.payNwText}>{I18n.t('Pay Now')}</Text>
                        </TouchableOpacity>
                      </View>
                  </View>
                );
                break;
              }
            }
          }
        }else{
          card_pay_array.push(
            <View
                key={s}
                style={styles.payCard}>
                <View style={styles.PayCardSecondView}>
                  {current_day >= 27 || current_day <= 3 ?
                  <View style={styles.remaining}>
                    <Text style={styles.days}>{I18n.t('Days')}</Text>
                    <Text style={styles.daysNo}>{days_remain}</Text>
                    <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                  </View>
                  :
                  <View style={styles.remaining}>
                    <Text style={styles.days}>{I18n.t('Days')}</Text>
                    <Text style={styles.daysNo}>00</Text>
                    <Text style={styles.remainingText}>{I18n.t('Remaining')}</Text>
                  </View>
                  }
                  <View style={styles.remainingSecondView}>
                    {I18n.locale == 'ar' ?
                    <View style={{width:'100%'}}>
                        <View style={{width:220}}>
                          <Text style={styles.secondPayMonthAr}>{I18n.t('Instalment')}<Text style={styles.payMonthAr}> {monthNamesAr[monthCondition-1]}</Text> </Text>
                        </View>
                    </View>
                    :
                    <View>
                        <View style={{width:220}}>
                          <Text style={styles.payMonth}>{monthNames[monthCondition-1]} <Text style={styles.secondPayMonth}> {I18n.t('Instalment')}</Text> </Text>
                        </View>
                    </View>
                    }
                    <View style={styles.payFor}>
                        <Image 
                          style={styles.infoIcon}
                          source={require('../../assets/information_button_2.png')}></Image>
                        <View style={styles.payForContainer}>
                          <View style={styles.payForFirstView}>
                          {profile_photo == null ?
                            <Image 
                            style={styles.Avatar}
                            source={require('../../assets/user.png')}></Image>
                            :
                            <Image 
                            style={styles.Avatar}
                            source={{ uri: profile_photo}}></Image>
                            }
                          </View>
                          {I18n.locale == 'ar' ?
                          <View style={styles.payForSecondView}>
                            {current_day >= 27 || current_day <= 3 ?
                            <Text style={styles.payForTextAr}>{I18n.t('You will pay')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} إلى </Text>
                            :
                            <Text style={styles.payForTextAr}>{I18n.t('Due Payment')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                            }
                            {current_day >= 27 || current_day <= 3 ?
                            <Text style={[styles.payForText,{fontWeight:'bold',marginRight:'auto'}]}>{cards[s].user.full_name} </Text>
                            :
                            <Text style={styles.payForTextAr}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                            }
                          </View>
                          :
                          <View style={styles.payForSecondView}>
                            {current_day >= 27 || current_day <= 3 ?
                            <Text style={styles.payForText}>{I18n.t('You will pay')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} To </Text>
                            :
                            <Text style={styles.payForText}>{I18n.t('Due Payment')} {cards[s].cycle.amount_per_month} {I18n.t('EGP')} </Text>
                            }
                            {current_day >= 27 || current_day <= 3 ?
                            <Text style={[styles.payForText,{fontWeight:'bold'}]}>{cards[s].user.full_name} </Text>
                            :
                            <Text style={styles.payForText}><Text style={{fontWeight:'bold'}}> {cards[s].user.full_name} </Text>{I18n.t('cashout')}</Text>
                            }
                          </View>
                          }
                        </View>
                    </View>
                  </View>
                </View>
                <View style={styles.payCardButtons}>
                  <TouchableOpacity onPress={()=> this.handle_Details(IDS) } style={styles.payDetailsButton}>
                    <Text style={styles.payDetailsText}>{I18n.t('Cycle details')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=> this.handle_payConfirm(month,full_name,amount_per_month,IDS,profile_photo,'new',wallet)}  style={styles.payNwButton}>
                    <Text style={styles.payNwText}>{I18n.t('Pay Now')}</Text>
                  </TouchableOpacity>
                </View>
            </View>
          );
        }
        // if(cardInfo.length > 0){
          
        // }else{
         
        // }
      }
    }
    return card_pay_array;
    // return <Text style={{color:'red',fontSize:22}}>{card_pay_array.length}</Text>;
  }; 
 _handleOpenURL = (event) => {
    const { navigation } = this.props;
    console.log(event.url);
    if (event.url) {
      let monthVal;
      let codeVal;
      let from;
      const sPageURL = event.url.substring(1);
      const sURLVariables = sPageURL.split('?');
      for (let i = 0; i < sURLVariables.length; i++) {
        const sParameterName = sURLVariables[i].split('=');
        const sParameterValues = sParameterName[i].split('&');
        if (sParameterName[0] == 'month') {
          monthVal = sParameterValues[0];
        }
        if (sParameterValues[1] == 'code') {
          const codeValues = sParameterName[2].split('&');
          codeVal = codeValues[0];
          if (codeValues[1] == 'from') {
            from  = sParameterName[3] / codeValues[0];
          }
        }
      }
      AsyncStorage.getItem('session', (err, result) => {
        const create_data = new FormData();
        create_data.append('collect_month', monthVal);
        create_data.append('cycle_code', codeVal);
        create_data.append('action_id', from);
        const config = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${result}`
          },
          body: create_data
        };
        fetch('http://www.elgameya.net/api/join/deep/cycle', config)
        // fetch('http://localhost:8000/api/join/deep/cycle', config)
          .then(response => response.json())
          .then(responseJson => {
          // alert(JSON.stringify(responseJson))
          let DeepData = responseJson;
          console.log('from deep :'+JSON.stringify(DeepData))
            if (responseJson.success) {
              navigation.navigate('CycleDetails', {
                cycle_id: responseJson.success.cycle_data[0].id,
                Home:1
              });
            }else if(responseJson.duplicated){
                alert('You are already used this invitation');
            }else if(responseJson.taken){
                alert('This invitation used already');
            }else if(responseJson.denied){
                alert('You already member');
            }else{
                alert('Unexpected error');
            }
          })
          .catch(err => {
            alert('Unexpected error');
          });
      });
    }else{
      Linking.getInitialURL()
      .then(url => {
        console.log('url init : '+url)
        let monthVal;
        let codeVal;
        let from;
        if (url) {
          const sPageURL = url.substring(1);
          const sURLVariables = sPageURL.split('?');
          for (let i = 0; i < sURLVariables.length; i++) {
            const sParameterName = sURLVariables[i].split('=');
            const sParameterValues = sParameterName[i].split('&');
            if (sParameterName[0] == 'month') {
              monthVal = sParameterValues[0];
            }
            if (sParameterValues[1] == 'code') {
              const codeValues = sParameterName[2].split('&');
              codeVal = codeValues[0];
              console.log('from deep : '+codeValues)
              if (codeValues[1] == 'from') {
                from  = sParameterName[3] / codeValues[0];
              }
            }
          }
          AsyncStorage.getItem('session', (err, result) => {
            this.setState({ modalVisible: true });
            const create_data = new FormData();
            create_data.append('collect_month', monthVal);
            create_data.append('cycle_code', codeVal);
            create_data.append('action_id', from);
            const config = {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${result}`
              },
              body: create_data
            };
            fetch('http://www.elgameya.net/api/join/deep/cycle', config)
            // fetch('http://localhost:8000/api/join/deep/cycle', config)
              .then(response => response.json())
              .then(responseJson => {
                // alert(responseJson)
                console.log('from deep Home :'+JSON.stringify(responseJson))
                this.setState({modalVisible:false}, ()=> {
                  setTimeout(() => {
                    if (responseJson.success) {
                        this.props.navigation.navigate('CycleDetails', {
                          cycle_id: responseJson.success.cycle_data[0].id,
                          Home:1
                        });
                    } else if(responseJson.duplicated){
                        alert('you are already used this invitation');
                    } else if(responseJson.taken){
                        alert('this invitation used already');
                    } else if(responseJson.denied){
                        alert('You already member');
                    }else{
                        alert('Unexpected error');
                    }
                  }, 1000);
                });
                
              })
              .catch(err => {
                this.setState({modalVisible:false}, ()=> {
                  setTimeout(() => {
                    alert('Unexpected error');
                  }, 200);
                });
              });
          });
        }
      })
      .catch(err => console.error('An error occurred', err));
    }
  }
  
  render() {
    const { fadeAnim } = this.state;
    let spinner;
    spinner = (
      <TouchableOpacity style={{ marginTop: 380 }}>
        <ActivityIndicator size="large" color="#61ccf6" />
      </TouchableOpacity>
    );
    return (
      <Animated.View style={[styles.animatedView, { opacity: fadeAnim }]}>
        <View
          style={{
            height: StatusBar.currentHeight
          }}>
          <StatusBar translucent backgroundColor="#f9f9f9" barStyle="dark-content" />
        </View>
        <ScrollView vertical style={styles.scroll} contentContainerStyle={styles.contentStyle}>
          <Text style={styles.title}>{I18n.t('ElGameya')}</Text>
          {/** ************** Pay Gameya Card  *********** */}
          <ScrollView
            horizontal
            style={{
              width: '100%',
              // height: 'auto',
              backgroundColor: 'transparent',
              // alignSelf:'center'
            }}>
            {this.handle_payCard()}
            {/* <GameballWidget /> */}
            {/* <Text style={{color:'red',fontSize:22}}>search</Text> */}
          </ScrollView>
          {/** ************ end Pay Card & start create card  **************** */}
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Cycle')}
            style={styles.createCycleCard}>
            <Modal
              animationType="fade"
              transparent={false}
              visible={this.state.modalVisible}
              transparent
              onRequestClose={() => {
                this.stop(true);
              }}>
              {spinner}
            </Modal>
            {I18n.locale == 'en' ? (
              <Image source={require('../../assets/group_4023.png')} style={styles.createImageEn} />
            ) : (
              <Image source={require('../../assets/group_4023.png')} style={styles.createImageAr} />
            )}
            <View style={{ marginRight: 32, marginLeft: 'auto' }}>
              <Text style={{ color: '#929fb2', fontSize: 14 }}>{I18n.t('create')}</Text>
              <Text style={styles.newCycleText}>{I18n.t('newCycle')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Store')}
            style={{
              width: '90%',
              alignSelf: 'center',
              borderRadius: 5,
              height: 200,
              backgroundColor: '#F2C66F',
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
            <Image
              source={require('../../assets/group_3326.png')}
              style={{ width: 160, height: 160, marginTop: 16, marginLeft: 16 }}
            />
            <Image
              source={require('../../assets/group_3328.png')}
              style={{
                ...Platform.select({
                  ios: {
                    width: 120,
                    height: 45
                  },
                  android: {
                    width: 105,
                    height: 40
                  }
                }),
                marginTop: 16,
                marginLeft: 32
              }}
            />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }
}
