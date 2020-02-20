import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import {View, ActivityIndicator, StatusBar, ImageBackground, Linking, Alert} from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import HomeScreen from '../Home/HomeScreen';
import SelectScreen from '../Auth/select';
import LoginScreen from '../Auth/login';
import RegisterScreen from '../Auth/register';
import VerifyScreen from '../Auth/verify';
import IntroScreen from '../Home/Intro';
import CreateScreen from '../Patient/create';
import AllPatient from '../Patient/all';
import PatientScreen from '../Patient/patient';
import TodayPatient from '../Patient/today';
import MenuScreen from '../Menu/menu';
import DropDown from '../Auth/dropDown';
import CreateNurse from '../Nurse/create';
import AllNurses from '../Nurse/all';
import styles from '../Home/style';


class AuthNav extends React.Component {
  componentDidMount() {
    Linking.addEventListener('url', this.handle_activition);
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('url init : '+url);
        this.handle_activition();
      }else{
        this._bootstrapAsync();
      }
    }).catch(err => console.error('An error occurred', err));
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {

    const userToken =  await AsyncStorage.getItem('session');
    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');

  };
  handle_activition = () => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.setState({modalVisible:true})
        let urlValues = url.substring(1);
        const sURLVariables = urlValues.split('/');
        let emailVal;
        for (let i = 0; i < sURLVariables.length; i++){
          if(sURLVariables[i] == 'verify'){
            console.log('url data : '+sURLVariables[i]);
            emailVal = sURLVariables[i+1];
          } 
        }
        const create_data = new FormData();
        create_data.append('email',emailVal);
        const config = {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: create_data
        };
        fetch('http://oi-solution.com/CMSAPP/api/email/verify', config)
        .then(response => response.json())
        .then(responseJson => {
          console.log('deep active :'+JSON.stringify(responseJson.success))
          this.setState({modalVisible:false}, ()=> {
            setTimeout(() => {
              if(responseJson.success){
                setTimeout(() => {
                  AsyncStorage.setItem('session', responseJson.success.token);
                  AsyncStorage.setItem('userid', JSON.stringify(responseJson.success.user.id), () =>{
                    setTimeout(() => {
                      this.props.navigation.navigate('Home');
                    }, 200);
                  });
                }, 400);
              }else if(responseJson.alreadyused){
                Alert.alert(
                  'Link expired',
                  'This link has been already used',
                  [
                    {text: 'OK', onPress: () => this.props.navigation.navigate('Auth')},
                  ],
                  {cancelable: false},
                );
              }else{
                Alert.alert(
                  'Error',
                  'something went wrong please try again',
                  [
                    {text: 'OK'},
                  ],
                  {cancelable: false},
                );
              }
            }, 200);
          });
        })
        .catch(error => {
          console.log('login error : '+ error)
          this.setState({modalVisible:false}, ()=> {
            setTimeout(() => {
              alert('something went wrong please try again');
            }, 1000);
          });
        });
      }
    }).catch(err => console.error('An error occurred', err));
  }
  // Render any loading content that you like here
  render() {
    return (
      <ImageBackground source={require('../assets/intro.jpg')} style={styles.background}>
        <View>
          <ActivityIndicator />
          <StatusBar barStyle="default" />
        </View>
      </ImageBackground>
    );
  }
}

const AuthStack = createStackNavigator(
  {
    SelectAuth:SelectScreen,
    Login:LoginScreen,
    Register:RegisterScreen,
    Verify:VerifyScreen,
  },
  {
    initialRouteName: 'SelectAuth',
    headerMode: 'none'
  },
);

const VerifyStack = createStackNavigator(
  {
    Intro:IntroScreen,
    Home: HomeScreen,
  },
  {
    initialRouteName: 'Intro',
    headerMode: 'none'
  },
);

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    SelectAuth:SelectScreen,
    Login:LoginScreen,
    Register:RegisterScreen,
    CreatePatient:CreateScreen,
    MyPatient:AllPatient,
    TodayPatient:TodayPatient,
    Patient:PatientScreen,
    Menu: MenuScreen,
    Drop:DropDown,
    Intro:IntroScreen,
    CreateNurse:CreateNurse,
    AllNurses:AllNurses
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none'
  },
);

const MainNav = createStackNavigator(
  {
    App: HomeStack,
    Auth: AuthStack,
    AuthSession: AuthNav,
    Verified:VerifyStack
  },
  {
    initialRouteName: 'AuthSession',
    headerMode: 'none'
  }
);

export default AppNav = createAppContainer(MainNav);

