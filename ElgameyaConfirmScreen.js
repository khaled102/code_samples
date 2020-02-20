import React from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  BackHandler,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { ListItem, Avatar, Icon } from 'react-native-elements';
import I18n from '../../utils/i18n';
import styles from './style';

const windowWidth = Dimensions.get('window').width - 54;
const windowWidth2 = Dimensions.get('window').width - 63;

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
  
export default class ConfirmPay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      month: '',
      name: '',
      modalVisible: true,
      NotiData: '',
      amount:'',
      owner:'',
      cycleID:'',
      Home: props.navigation.state.params.Home,
      user_photo:'',
      ownerID:'',
      ownerMobile:'',
      ownerEmail:'',
      profit_number:'1',
      cashVisible:false,
      gateway:'',
      walletVisible:false,
      wallet:false,
      walletAmount:''
    };
  }
  componentDidMount(){
    AsyncStorage.getItem('session', (err, result) => {
      const config = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${result}`
        }
      };
      fetch('http://www.elgameya.net/api/user/details', config)
        .then(response => response.json())
        .then(responseJson => {
          this.setState({
            modalVisible: false,
            owner: responseJson.success.full_name,
            owner_photo: responseJson.success.photo,
            ownerID:responseJson.success.id,
            ownerMobile:responseJson.success.phone,
            ownerEmail:responseJson.success.email,
            walletAmount:responseJson.success.wallet
          });
        });
    });
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if(this.state.Home){
        this.props.navigation.navigate('Home');
      } 
      else{
        this.props.navigation.navigate('CycleDetails', { 
          cycle_id: this.props.navigation.state.params.cycle_id,
        });
      }
      return true;
    });
  }
  componentWillUnmount() {
    this.backHandler.remove();
  }
  componentWillMount() {
    this.setState({
        month:this.props.navigation.state.params.month,
        name:this.props.navigation.state.params.fullName,
        amount:this.props.navigation.state.params.amount,
        cycleID:this.props.navigation.state.params.cycleID,
        user_photo:this.props.navigation.state.params.profile,
        gateway:this.props.navigation.state.params.GateWay
    });
    this.handle_profit();
  }
  handle_profit = () => {
    AsyncStorage.getItem('session', (err, result) => {
      const create_data = new FormData();
      create_data.append('cycle_id', this.state.cycleID);
      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${result}`
        },
        body: create_data
      };
      fetch('http://www.elgameya.net/api/user/cashout/profit', config)
        .then(response => response.json())
        .then(responseJson => {
          console.log('profit number : '+ responseJson.member.length)
          this.setState({profit_number:responseJson.member.length,amount:this.state.amount * responseJson.member.length});
        }).catch(err => {
          setTimeout(() => {
            console.log(err);
          }, 500);
        });
    });
  };
  stop_spinner() {
    this.setState({ modalVisible: false });
  }
  handle_confirmation = () => {
    this.setState({ modalVisible: true, walletVisible:false });
    AsyncStorage.getItem('session', (err, result) => {
      const create_data = new FormData();
      let gameya_amount = JSON.parse( (this.state.amount*2) / 100 );
      if(gameya_amount > 20){
        gameya_amount = 20;
      }
      let gameya_profit = gameya_amount * this.state.profit_number;
      create_data.append('cycle_id', this.state.cycleID);
      create_data.append('month', this.state.month);
      create_data.append('amount', JSON.parse(this.state.amount+gameya_profit));
      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${result}`
        },
        body: create_data
      };
      fetch('http://www.elgameya.net/api/cycle/checkout/payment', config)
        .then(response => response.json())
        .then(responseJson => {
          console.log('checkout fawry prepare data : '+JSON.stringify(responseJson));
          this.setState({modalVisible:false}, ()=> {
            setTimeout(() => {
              if(this.state.Home){
                this.props.navigation.navigate('cyclePayment',{
                  cycle_id:this.state.cycleID,
                  Merchant:responseJson[0].id,
                  Home:this.state.Home,
                  amount:JSON.parse(this.state.amount)+gameya_profit,
                  full_name:this.state.owner,
                  user_id:this.state.ownerID,
                  user_mobile:this.state.ownerMobile,
                  user_email:this.state.ownerEmail
                });
              }else{
                this.props.navigation.navigate('cyclePayment',{
                  cycle_id:this.state.cycleID,
                  Merchant:responseJson[0].id,
                  amount:JSON.parse(this.state.amount)+10,
                  full_name:this.state.owner,
                  user_id:this.state.ownerID,
                  user_mobile:this.state.ownerMobile,
                  user_email:this.state.ownerEmail
                });
              }
            }, 200);
          });          
        }).catch(err => {
          this.stop_spinner();
          setTimeout(() => {
            alert(err);
            console.log(err);
          }, 500);
        });
    });
  };
  handle_iosBack = () =>{
    if(this.state.Home){
      this.props.navigation.navigate('Home');
    }else{
      this.props.navigation.navigate('CycleDetails', { cycle_id: this.state.cycleID });
    }
  }
  handle_selectPayment = () => {
    this.setState({cashVisible:true});
  };
  handle_selectFawry = () => {
    this.handle_walletFees();
    // this.setState({walletVisible:true});
  }
  handle_selectCash = () => {
    this.setState({cashVisible:false});
    this.handle_cashConfirmed();
  }
  handle_cashConfirmed = () => {
    this.setState({ modalVisible: true });
    AsyncStorage.getItem('session', (err, result) => {
      const create_data = new FormData();
      let gameya_amount = JSON.parse( (this.state.amount*2) / 100 );
      if(gameya_amount > 20){
        gameya_amount = 20;
      }
      let gameya_profit = gameya_amount * this.state.profit_number;
      create_data.append('cycle_id', this.state.cycleID);
      create_data.append('month', this.state.month);
      create_data.append('amount', JSON.parse(this.state.amount+gameya_profit));
      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${result}`
        },
        body: create_data
      };
      fetch('http://www.elgameya.net/api/cycle/cash/payment', config)
        .then(response => response.json())
        .then(responseJson => {
          console.log('checkout cash prepare data : '+JSON.stringify(responseJson));
          this.setState({modalVisible: false}, () => {
              setTimeout( () => {
                Alert.alert(
                  I18n.t('Cash'),
                  I18n.t('cashMessage'),
                  [
                    {text: 'OK', onPress: () => this.cashPayment_notis(responseJson.member[0].user_id,responseJson.cash[0].user_id)},
                  ],
                  {cancelable: false},
                );
              }, 200);
          });
            
          // if(this.state.Home){
            
          // }else{
          //   this.props.navigation.navigate('cyclePayment');
          // }
        }).catch(err => {
          this.setState({modalVisible:false});
          setTimeout(() => {
            alert(err);
            console.log(err);
          }, 3000);
        });
    });
  };
  handle_walletFees = () => {
    this.setState({ modalVisible: false, walletVisible:false, cashVisible:false });
    AsyncStorage.getItem('session', (err, result) => {
      const create_data = new FormData();
      let gameya_amount = JSON.parse( (this.state.amount*2) / 100 );
      if(gameya_amount > 20){
        gameya_amount = 20;
      }
      let gameya_profit = gameya_amount * this.state.profit_number;
      let user_wallet = this.state.walletAmount;
      if(user_wallet > JSON.parse(this.state.amount+gameya_profit)){
        user_wallet = JSON.parse(this.state.amount+gameya_profit-5);
      }
      create_data.append('cycle_id', this.state.cycleID);
      create_data.append('month', this.state.month);
      create_data.append('amount', JSON.parse(this.state.amount+gameya_profit-user_wallet));
      create_data.append('wallet_amount', user_wallet);
      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${result}`
        },
        body: create_data
      };
      fetch('http://www.elgameya.net/api/cycle/checkout/payment', config)
        .then(response => response.json())
        .then(responseJson => {
          console.log('checkout fawry prepare data : '+JSON.stringify(responseJson));
          this.setState({modalVisible:false}, ()=> {
            setTimeout(() => {
              if(this.state.Home){
                this.props.navigation.navigate('cyclePayment',{
                  cycle_id:this.state.cycleID,
                  Merchant:responseJson[0].id,
                  Home:this.state.Home,
                  amount:JSON.parse(this.state.amount+gameya_profit-user_wallet),
                  full_name:this.state.owner,
                  user_id:this.state.ownerID,
                  user_mobile:this.state.ownerMobile,
                  user_email:this.state.ownerEmail
                });
              }else{
                this.props.navigation.navigate('cyclePayment',{
                  cycle_id:this.state.cycleID,
                  Merchant:responseJson[0].id,
                  amount:JSON.parse(this.state.amount+gameya_profit-user_wallet),
                  full_name:this.state.owner,
                  user_id:this.state.ownerID,
                  user_mobile:this.state.ownerMobile,
                  user_email:this.state.ownerEmail
                });
              }
            }, 200);
          });          
        }).catch(err => {
          this.stop_spinner();
          setTimeout(() => {
            alert(err);
            console.log(err);
          }, 500);
        });
    });
  }
  cashPayment_notis = (Data,Data2) => {
    this.props.navigation.dismiss();
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    };
      fetch(`http://elgameya.net/push/notification/${Data}/4/${Data2}`, config)
      .then(response => response.text())
      .then(responseJson => {
          console.log('cash notification : '+ responseJson);
      })
  };
  stop = () => {
    this.setState({cashVisible:true,modalVisible:false});
  }
  render() {
    let spinner;
    spinner = (
      <TouchableOpacity style={{ marginTop: 300 }}>
        <ActivityIndicator size="large" color="#61ccf6" />
      </TouchableOpacity>
    );
    let gameya_amount = JSON.parse( (this.state.amount*2) / 100 );
    if(gameya_amount > 20){
      gameya_amount = 20;
    }
    let gameya_profit = gameya_amount * this.state.profit_number;
    let walletdetails = this.state.walletAmount;
    if(walletdetails > JSON.parse(this.state.amount+gameya_profit)){
      walletdetails = JSON.parse(this.state.amount+gameya_profit-5);
    }
    const list = [
        {
        title: 'Amount (EGP)',
        badge:{ value: this.state.amount, textStyle: styles.bagdeText }
        },
        {
        title: 'El Gameya (EGP)',
        badge:{ value: gameya_profit, textStyle: styles.bagdeText }
        },
        {
        title: 'Sub Total  (EGP)',
        badge:{ value: JSON.parse(this.state.amount+gameya_profit), textStyle: [styles.bagdeText,{color:'#080b65'}]}
        },
        {
          title: 'Wallet (EGP)',
          badge:{ value: - walletdetails, textStyle: styles.bagdeText }
        },
        {
        title: 'Total  (EGP)',
        badge:{ value: JSON.parse(this.state.amount+gameya_profit-walletdetails), textStyle:styles.bagdeTotalText}
        }
    ];
    const listAr = [
      {
      title: 'المبلغ بالجنيه',
      badge:{ value: this.state.amount, textStyle: styles.bagdeText }
      },
      {
      title: 'الجمعيه (جنيه)',
      badge:{ value: gameya_profit, textStyle: styles.bagdeText }
      },
      {
      title: 'المجموع الفرعي',
      badge:{ value: JSON.parse(this.state.amount)+gameya_profit, textStyle: [styles.bagdeText,{color:'#080b65'}]}
      },
      {
        title: 'المحفظه (بالجنيه)',
        badge:{ value: - walletdetails, textStyle: styles.bagdeText }

      },
      {
      title: 'الاجمالي (بالجنيه)',
      badge:{ value: JSON.parse(this.state.amount+gameya_profit-walletdetails), textStyle:styles.bagdeTotalText}
      }
    ];
    let cashModal;
        cashModal =   <View style={styles.cashModal}>
                            <TouchableOpacity style={{height:100,width:'100%',justifyContent:'center'}}>
                                <Icon
                                    name={'x'}
                                    type="octicon"
                                    size={24}
                                    color="#ffffff"
                                    containerStyle={{marginLeft:16,marginRight:'auto',marginTop:16}}
                                    onPress={()=> this.setState({cashVisible:false})}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={{width:'100%',height:170,marginTop:5}} onPress={()=> this.setState({cashVisible:false})} />
                            <View style={styles.selectedContainer}>
                              <Text style={[styles.arrowText,{color:'#F2C66F',fontSize:14,fontWeight:'bold'}]}>{I18n.t('method')}</Text>
                              <View style={styles.selectedView}>
                                <TouchableOpacity  onPress={()=> this.handle_selectFawry()}>
                                  <Image
                                    source={require('../../assets/fawry.png')}
                                    style={{ width: 200, height: 90, resizeMode: 'contain',marginTop:16 }}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cashView}  onPress={()=> this.handle_selectCash()}>
                                  <Image
                                    source={require('../../assets/cash.png')}
                                    style={{ width: 150, height: 70, resizeMode: 'contain',marginTop:16 }}
                                  />
                                  <Text style={[styles.arrowText,{color:'#F2C66F',fontSize:14,padding:3}]}>{I18n.t('Cash')}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <TouchableOpacity style={{width:'100%',height:460,marginTop:2}} onPress={()=> this.setState({cashVisible:false})} />
                      </View>;
    walletModal = (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#6C6C6C',
          opacity: 0.92,
          alignItems: 'center'
        }}>
        <TouchableOpacity
          onPress={() => this.setState({ walletVisible: false, wallet:false })}
          style={{
            width: '100%',
            alignItems: 'center',
            ...Platform.select({
              ios: {
                height: 300
              },
              android: {
                height: 150
              }
            }),
            backgroundColor: 'transparent',
            zIndex: 1
          }}
        />
        <View
          style={{
            width: '80%',
            alignItems: 'center',
            height: 160.7,
            backgroundColor: '#ffffff',
            borderRadius: 3.3,
          }}>
          <View style={{ marginTop: 20, width: '90%', alignSelf: 'center' }}>
          {!this.state.wallet ?
            <Text
                style={{
                  fontSize: 16,
                  marginTop: 16,
                  alignSelf: 'center',
                  color: '#3f3f3f'
                }}>
                {I18n.t('walletConfrimation')}
            </Text>
            :
            <Text
                style={{
                  fontSize: 14,
                  marginTop: 16,
                  marginLeft: 14,
                  marginRight: 'auto',
                  color: '#3368C4'
                }}>
                {I18n.t('enterAmount')}
            </Text>
          }
            {!this.state.wallet ?
            <View style={{flexDirection:'row',width:'100%',justifyContent:'center',alignItems:'center',marginTop:20}}>
              <TouchableOpacity
                onPress={() => this.handle_walletFees() }
                style={{
                  backgroundColor: '#080b65',
                  width: 80,
                  height: 30,
                  borderRadius: 3.3,
                  marginTop: 16,
                  marginBottom: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight:5
                }}>
                <Text style={{ fontSize: 14, color: '#ffffff' }}>{I18n.t('Yes')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.handle_confirmation() }
                style={{
                  backgroundColor: '#080b65',
                  width: 80,
                  height: 30,
                  borderRadius: 3.3,
                  marginTop: 16,
                  marginBottom: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft:5
                }}>
                <Text style={{ fontSize: 14, color: '#ffffff' }}>{I18n.t('No')}</Text>
              </TouchableOpacity>
            </View>
            :
            <TextInput
              style={{
                width: '100%',
                height: 60,
                marginLeft: 14,
                color: '#484545',
                backgroundColor: 'transparent',
                fontSize: 16,
                borderRadius: 25
              }}
              placeholder={I18n.t('Amount') + this.state.walletAmount}
              placeholderTextColor="#929fb2"
              underlineColorAndroid="transparent"
              multiline
              onChangeText={value => this.setState({ user_address: value })}
            />
            }
            {this.state.wallet ?
            <TouchableOpacity
              onPress={() => this.confirm_buy()}
              style={{
                backgroundColor: '#F2C66F',
                width: '80%',
                height: 30,
                borderRadius: 5,
                marginTop: 16,
                marginBottom: 10,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center'
              }}>
              <Text style={{ fontSize: 16, color: '#000000' }}>{I18n.t('Confirm')}</Text>
            </TouchableOpacity>
            :
            <View />
            }
          </View>
        </View>
        <TouchableOpacity
          onPress={() => this.setState({ walletVisible: false, wallet:false })}
          style={{
            width: '100%',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'transparent',
            zIndex: 1,
            marginTop: 5
          }}
        />
      </View>
    );
    return (
      <View style={styles.container}>
        <TouchableOpacity
            onPress={() => this.handle_iosBack()}
            style={styles.header}>
            <View style={{ marginLeft: 16 }}>
            <Icon
                name={'x'}
                type="octicon"
                size={18}
                color="#626262"
            />
            </View>
            <View style={{ marginLeft: 10 }}>
            <Text
                style={styles.headerText}>
                {I18n.t('Pay')}
            </Text>
            </View>
        </TouchableOpacity>
        <ScrollView style={styles.ScrollView}>
            <View style={styles.avatar}>
                <View style={styles.avatarView1}>
                  {this.state.owner_photo == null ?
                    <Avatar
                        rounded
                        // source={{
                        // uri:
                        //     'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                        // }}
                        icon={{ name: 'person' }}
                        size="large"
                        containerStyle={{ alignSelf: 'center', marginTop: 20, borderColor:'#ffffff', borderWidth:1  }}
                    />
                    :
                    <Avatar
                        rounded
                        source={{
                        uri:
                            this.state.owner_photo,
                        }}
                        // icon={{ name: 'person' }}
                        size="large"
                        containerStyle={{ alignSelf: 'center', marginTop: 20, borderColor:'#ffffff', borderWidth:1  }}
                    />
                  }
                    <Text
                       style={[styles.avatarText,{marginTop:5,width:100}]}>
                        {this.state.owner}
                    </Text>
                </View>
                <View style={styles.avatarView2}>
                    <Image source={require('../../assets/path_3069_pay.png')} style={styles.arrow} />
                    {I18n.locale == 'ar' ?
                    <Text style={[styles.avatarText,{color:'#fbc461'}]}>
                      <Text style={[styles.avatarText,{color:'#ffffff'}]}> {I18n.t('cycleConfirm')} </Text>  {monthNamesAr[JSON.parse(this.state.month)+1]}
                    </Text>
                    :
                    <Text style={[styles.avatarText,{color:'#fbc461'}]}>
                        {monthNames[this.state.month-1]}<Text style={[styles.avatarText,{color:'#ffffff'}]}> {I18n.t('cycle')} </Text>
                    </Text>
                    }
                </View>
                <View style={styles.avatarView3}>
                  {this.state.user_photo == null ?
                    <Avatar
                        rounded
                        // source={{
                        // uri:
                        //     'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                        // }}
                        icon={{ name: 'person' }}
                        size="large"
                        containerStyle={{ alignSelf: 'center', marginTop: 20, borderColor:'#ffffff', borderWidth:1 }}
                    />
                    :
                    <Avatar
                        rounded
                        source={{
                        uri:
                            this.state.user_photo,
                        }}
                        // icon={{ name: 'person' }}
                        size="large"
                        containerStyle={{ alignSelf: 'center', marginTop: 20, borderColor:'#ffffff', borderWidth:1 }}
                    />
                  }
                    <Text
                        style={[styles.avatarText,{marginTop:5,width:100}]}>
                        {this.state.name}
                    </Text>
                </View>
            </View>
            {I18n.locale == 'ar' ?
            <View
              style={styles.detailsView}>
              {listAr.map((l, i) => (
                <ListItem
                  containerStyle={styles.listStyle}
                  key={i}
                  title={l.title}
                  subtitleStyle={{ color: '#626262' }}
                  topDivider
                  bottomDivider
                  titleStyle={{ color: '#3f3f3f',fontSize:14 }}
                  // onPress={() => this.handleOnPress(i)}
                  badge={l.badge}
                />
              ))}
            </View>
            :
            <View
              style={styles.detailsView}>
              {list.map((l, i) => (
                <ListItem
                  containerStyle={styles.listStyle}
                  key={i}
                  title={l.title}
                  subtitleStyle={{ color: '#626262' }}
                  topDivider
                  bottomDivider
                  titleStyle={{ color: '#3f3f3f',fontSize:14 }}
                  // onPress={() => this.handleOnPress(i)}
                  badge={l.badge}
                />
              ))}
            </View>
            }
            <View style={styles.summary}>
                {/* <Text
                    style={styles.summaryText}>
                    50 {I18n.t('points')}
                </Text> */}
                {/* <Image source={require('../../assets/group_2719.png')} style={styles.summaryImage} /> */}
                {/* <Text
                    style={styles.summaryText2}
                    onPress={()=>this.props.navigation.navigate('CycleDetails', { cycle_id: this.state.cycleID }) }>
                    {I18n.t('Open Cycle')}
                </Text> */}
            </View>
            <TouchableOpacity onPress={ ()=> this.handle_selectPayment()} style={styles.ConfirmButton}>
                <Text style={{ color: '#000000', fontSize: 14 }}>{I18n.t('Confirm Payment')}</Text>
            </TouchableOpacity>
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
            <Modal
                animationType="fade"
                transparent={false}
                visible={this.state.cashVisible}
                transparent
                onRequestClose={() => {
                this.stop(true);
                }}>
                {cashModal}
            </Modal>
            <Modal
                animationType="fade"
                transparent={false}
                visible={this.state.walletVisible}
                transparent
                onRequestClose={() => {
                this.stop(true);
                }}>
                {walletModal}
            </Modal>
        </ScrollView>
      </View>
    );
  }
}
