import * as admin from 'firebase-admin'
import size from 'lodash/fp/size'

console.log('Apps: ', admin.apps)
const { apps } = admin
const fireBaseAdmin =
    size(apps) < 1
        ? admin.initializeApp({
              credential: admin.credential.cert({
                  type: 'service_account',
                  project_id: process.env.PROJECT_ID,
                  private_key_id: process.env.PRIVATE_KEY_ID,
                  // TODO: Enclose your private key with double quotes ("") in env file otherwise parsing error will occur
                  private_key: process.env.PRIVATE_KEY,
                  client_email: process.env.CLIENT_EMAIL,
                  client_id: process.env.CLIENT_ID,
                  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                  token_uri: 'https://oauth2.googleapis.com/token',
                  auth_provider_x509_cert_url:
                      'https://www.googleapis.com/oauth2/v1/certs',
                  client_x509_cert_url: process.env.CLIENT_CERT_URL,
              }),
              databaseURL:
                  process.env.DATABASE_URL || process.env.FIREBASE_DB_URL,
          })
        : apps[0]

export function intializeFirebase() {
    return fireBaseAdmin
}

export function getFireBaseAdmin() {
    return fireBaseAdmin
}

export function createFBData(path, child, data) {
    const db = fireBaseAdmin.database()
    return db
        .ref(path)
        .child(child)
        .set(data, error => {
            if (error) {
                console.log('Data could not be saved.' + error)
                return false
            } else {
                console.log('Data saved successfully.')
                return true
            }
        })
}

export function updateFBData(path, child, data) {
    const db = fireBaseAdmin.database()
    return db
        .ref(path)
        .child(child)
        .update(data, error => {
            if (error) {
                console.log('Data could not be updated.' + error)
                return error
            } else {
                console.log('Data updated successfully.')
                return data
            }
        })
}

export function updateMutipleFBChilds(pathArray) {
    const db = fireBaseAdmin.database()
    return db.ref().update({ pathArray }, error => {
        if (error) {
            console.log('Data could not be updated.' + error)
            return error
        } else {
            console.log('Data updated successfully.')
            return data
        }
    })
}

export function getFBData(path, child) {
    const db = fireBaseAdmin.database()
    return db
        .ref(path)
        .child(child)
        .once('value', data => {
            return data
        })
}

// TODO: Attach all listeners to app for realtime database events
export function attachFBListener(
    path,
    child,
    event,
    responseCallback,
    errorCallback,
) {
    const db = fireBaseAdmin.database()
    return db
        .ref(path)
        .child(child)
        .on(event, responseCallback, errorCallback)
}
