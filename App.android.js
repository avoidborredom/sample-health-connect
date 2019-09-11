/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, useEffect, useState} from 'react';
import {
  AsyncStorage,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  StatusBar,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import GoogleFit, { Scopes } from 'react-native-google-fit';
import moment from 'moment';

import { backTask } from './background';

const options = {
  permissions: {
      read: ["Height", "Weight", "StepCount", "DateOfBirth", "BodyMassIndex", "ActiveEnergyBurned"],
      write: ["Height", "Weight", "StepCount", "BodyMassIndex", "Biotin", "Caffeine", "Calcium", "Carbohydrates", "Chloride", "Cholesterol", "Copper", "EnergyConsumed", "FatMonounsaturated", "FatPolyunsaturated", "FatSaturated", "FatTotal", "Fiber", "Folate", "Iodine", "Iron", "Magnesium", "Manganese", "Molybdenum", "Niacin", "PantothenicAcid", "Phosphorus", "Potassium", "Protein", "Riboflavin", "Selenium", "Sodium", "Sugar", "Thiamin", "VitaminA", "VitaminB12", "VitaminB6", "VitaminC", "VitaminD", "VitaminE", "VitaminK", "Zinc", "Water"]
  }
};

const healthInit = async (setAuthorize) => {
  
  GoogleFit.authorize(options)
  .then(authResult => {
    console.log(authResult, 'result')
    if (authResult.success) {
      console.log("AUTH_SUCCESS");
      setAuthorize(1);
      return;
    } else {
      console.log("AUTH_DENIED", authResult.message);
      return;
    }
  })
  .catch(() => {
    console.log("AUTH_ERROR");
  })
  
}

const getSteps = (setHealthData,setLastUpdated) => {
  const options = {
    startDate: "2017-01-01T00:00:17.971Z", // required ISO8601Timestamp
    endDate: new Date().toISOString() // required ISO8601Timestamp
  };

  GoogleFit.getDailyStepCountSamples(options)
   .then(async (results) => {
       console.log('Daily steps >>> ', results)

       const date = moment(Date.now()).format('YYYY-MM-DD, h:mm:ss a');

       await AsyncStorage.setItem("lastUpdated", date);
       await AsyncStorage.setItem("healthData", JSON.stringify(results));

       setLastUpdated(date);
       setHealthData(JSON.stringify(results));
   })
   .catch((err) => {console.warn(err)})
}

const init = async (setLastUpdated,setHealthData) => {
  const lastDate = await AsyncStorage.getItem('lastUpdated');
  const lastHealthData = await AsyncStorage.getItem('healthData');
  setHealthData(lastHealthData);
  setLastUpdated(lastDate);
}

const App = () => {
  const [lastUpdated, setLastUpdated] = useState(0);
  const [healthData, setHealthData] = useState("No Data");
  const [isAuth, setAuthorize] = useState(0);

  useEffect(() => {
    healthInit(setAuthorize);
    init(setLastUpdated,setHealthData);
  }, []);

  if(isAuth){
    backTask(() => { getSteps(setHealthData,setLastUpdated) });
  }

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={{paddingTop:10}}>
            <Text style={styles.sectionDescription}>Last Updated:{lastUpdated}</Text>
            <Text></Text>
            <Text style={styles.sectionTitle}>Health Data</Text>
            <TextInput
              multiline={true}
              numberOfLines={10}
              value={healthData}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
