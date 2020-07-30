# agile-tester
Test electron app with spectron

### Environment:
- Windows
- Linux

### Installation:
- install Agile
- Clone this repository
- cd agile-tester/test/
- npm i
- Load a database state

### Use: (for Windows run as administrator)
- npm run testScript
- mocha fileTest.js

### Maintenance:
- All the ids are in selectors.js
- Linux admin credentials and Agile path are in set-before-test.js
- Test inputs are in test-values.js
- Redis interaction functions are in db.js
- Test functions are in utils.js