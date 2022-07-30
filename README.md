# DrugRx Application - CM3050 Mobile Development Final Project

> DrugRx is an application that provides some useful information about any drug by just typing the drug name.
> It also provides information about the nearest pharmacies to your location.
> The application is tested on both the Android and the iOS and it works just fine, but it's not working on the web as the react-native-gifted-charts library is not supported on the web as it's not meant to be displayed on the web but on the mobile.

## DrugRx Application is providing 6 main functionalities:

> Provides List of Drug Adverse Events.
>> - For running this function you need to type a valid drug name in the input text in the home screen.
>> - Then press on the Drug Adverse Event button and it will navigate to the list of adverse events of the entered drug.
>> - Press enter after typing the drug name to be validated before pressing on the Drug Adverse Event button.
>> - To see number of people reported about each record in the list, press on the record and a message will pop up.

> Provides List of Drug Indications.
>> - For running this function you need to type a valid drug name in the input text in the home screen.
>> - Then press on the Drug Indications button and it will navigate to the list of Indications of the entered drug.
>> - Press enter after typing the drug name to be validated before pressing on the Drug Indications button.
>> - To see number of people reported about each record in the list, press on the record and a message will pop up.

> Provides List of Drug Interactions.
>> - For running this function you need to type a valid drug name in the input text in the home screen.
>> - Then press on the Drug Interactions button and it will navigate to the list of Interactions of the entered drug.
>> - Press enter after typing the drug name to be validated before pressing on the Drug Interactions button.
>> - To see number of people reported about each record in the list, press on the record and a message will pop up.

> Provides List of Drug Routes of Administration.
>> - For running this function you need to type a valid drug name in the input text in the home screen.
>> - Then press on the Routes of Administration button and it will navigate to the list of Routes of Administration of the entered drug.
>> - Press enter after typing the drug name to be validated before pressing on the Routes of Administration button.
>> - To see number of people reported about each record in the list, press on the record and a message will pop up.

> Provides a pie chart for the categories of people recorded the information about the drug you entered.
>> - For running this function you need to type a valid drug name in the input text in the home screen.
>> - Then press on the Categories of people reported button and it will navigate to the Pie Chart screen showing the categories.
>> - Press enter after typing the drug name to be validated before pressing on the Categories button.

> Provide list of the Nearest pharmacies
>> - For running this function, you need to press on the pharmacy icon on the right top of the screen.
>> - For the first run of the application, a message will pop up asking for the permission of accessing your location.
>> - If the accessibility is granted it navigates to the list of pharmacies screen.
>> - If the accessibility is not granted an alert will pop up to inform the user that permission is not allowed and the settings need to be adjusted for giving the permission to run the functionality.
>> - For finding the address of the pharmacies in the pharmacies list, press on the pharmacy of interest and a message with the pharmacy address will pop up.

## scripts for running the application.
> - For the application to run properly, Please make sure that all the packages are installed using npm install or yarn add commands.
> - For running the application, Please use: expo start.
> - packages used for developing the application:
>> - "@expo-google-fonts/skranji": "^0.2.2",
      "@react-navigation/native": "^6.0.8",
      "@react-navigation/native-stack": "^6.5.0",
      "expo": "~44.0.0",
      "expo-app-loading": "~1.3.0",
      "expo-font": "~10.0.4",
      "expo-location": "~14.0.1",
      "expo-status-bar": "~1.2.0",
      "react": "17.0.1",
      "react-dom": "17.0.1",
      "react-native": "0.64.3",
      "react-native-canvas": "^0.1.38",
      "react-native-gesture-handler": "^2.2.0",
      "react-native-gifted-charts": "^1.0.5",
      "react-native-linear-gradient": "^2.5.6",
      "react-native-reanimated": "^2.4.1",
      "react-native-safe-area-context": "3.3.2",
      "react-native-screen": "^1.0.1",
      "react-native-screens": "^3.11.0",
      "react-native-svg": "^12.1.1",
      "react-native-tableview-simple": "^4.3.1",
      "react-native-web": "0.17.1",
      "react-native-webview": "^11.17.2"

## scripts for running the tests.
> - For the tests to run properly, Please make sure that all the testing packages are installed using npm install or yarn add commands.
> - For running the test, Please use: npm test.
> - packages used for testing the application:
>> - "@testing-library/react-native": "^9.0.0",
     "@testing-library/user-event": "^13.5.0",
     "jest": "^26.4.0",
     "jest-expo": "^44.0.1",
     "jest-fetch-mock": "^3.0.3"
