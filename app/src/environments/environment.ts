// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  auth: 'http://localhost:3000/api/authentication/',
  apiUrl: 'http://localhost:3000/api/',
  adminUrl: 'http://localhost:3000/admin/',
  teacherUrl: 'http://localhost:3000/teacher/',
  studentUrl: 'http://localhost:3000/student/',
  usernamePattern: /^.*$/,
  phoneValidator: /^(0[1-9][0-9]{8})|(\+94[1-9][0-9]{8})$/,
  passwordValidator: /^(?=.*?[A-Z])(?=(.*[a-z])+)(?=(.*[\d])+)(?=(.*[\W])+)(?!.*\s).{8,}$/
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
