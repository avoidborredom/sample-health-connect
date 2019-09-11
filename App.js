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

import AppleHealthKit from 'rn-apple-healthkit';
import moment from 'moment';

import { backTask } from './background';

const options = {
  permissions: {
      read: ["Height", "Weight", "StepCount", "DateOfBirth", "BodyMassIndex", "ActiveEnergyBurned"],
      write: ["Height", "Weight", "StepCount", "BodyMassIndex", "Biotin", "Caffeine", "Calcium", "Carbohydrates", "Chloride", "Cholesterol", "Copper", "EnergyConsumed", "FatMonounsaturated", "FatPolyunsaturated", "FatSaturated", "FatTotal", "Fiber", "Folate", "Iodine", "Iron", "Magnesium", "Manganese", "Molybdenum", "Niacin", "PantothenicAcid", "Phosphorus", "Potassium", "Protein", "Riboflavin", "Selenium", "Sodium", "Sugar", "Thiamin", "VitaminA", "VitaminB12", "VitaminB6", "VitaminC", "VitaminD", "VitaminE", "VitaminK", "Zinc", "Water"]
  }
};

const healthInit = async (setHealthData, setLastUpdated) => {
  
  AppleHealthKit.initHealthKit(options, (err, results) => {
    if (err) {
        console.log("error initializing Healthkit: ", err);
        return;
    }
    console.log(results);
    // Height Example
    AppleHealthKit.getDailyStepCountSamples({
      startDate: (new Date(2016,1,1)).toISOString()
    }, async (err, results) => {
    if (err) {
      setHealthData('Error');
      console.log(err);
    }
      const date = moment(Date.now()).format('YYYY-MM-DD, h:mm:ss a');

      await AsyncStorage.setItem("lastUpdated", date);
      await AsyncStorage.setItem("healthData", JSON.stringify(results));

      console.log(JSON.stringify(results), 'health data');

      setLastUpdated(date);
      setHealthData(JSON.stringify(results));
    });
  });
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

  useEffect(() => {
    backTask(() => { healthInit(setHealthData,setLastUpdated) });

    // healthInit(setHealthData,setLastUpdated);

    
    init(setLastUpdated,setHealthData);
  }, []);

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
