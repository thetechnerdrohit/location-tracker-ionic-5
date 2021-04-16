import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  location = {
    latitude: 0,
    longitude: 0
  };
  public locationSubject = new Subject<any>();
  public requestBehaviourSubject = new BehaviorSubject<boolean>(false);

  constructor(private androidPermissions: AndroidPermissions, private locationAccuracy: LocationAccuracy, private _geolocation: Geolocation) {
  }

  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {

          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {

          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        this.requestBehaviourSubject.next(false);
        alert(err);
      }
    );
  }
  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error)
              this.requestBehaviourSubject.next(false);
            }
          );
      }
    });
  }
  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        this.getCurrentCordinates();
        // When GPS Turned ON call method to get Accurate location coordinates
      },
      error => {
        alert('Error requesting location permissions ' + JSON.stringify(error))
        this.requestBehaviourSubject.next(false);
      }
    );
  }
  getCurrentCordinates() {
    this._geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
      let latlng = {
        latitude: resp.coords.latitude,
        longitute: resp.coords.longitude
      };
      console.log("In Req ", JSON.stringify(latlng))
      this.locationSubject.next(latlng);
      this.requestBehaviourSubject.next(true);
    }).catch((error) => {
      alert('Error getting location - ' + error);
    });
  }
}
