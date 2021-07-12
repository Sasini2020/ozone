import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';

import {DataService} from '../../../_services/data.service';
import {MatDialogRef} from '@angular/material/dialog';
import {UserDataService} from '../../../_services/user-data.service';
import {HttpEventType} from '@angular/common/http';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css']
})
export class ProfilePictureComponent implements OnInit {

  @ViewChild('fileUpload') fileUploadClick: ElementRef;

  imageChangedEvent: any = '';
  croppedImageBase64: any = '';

  imageUploadProgress = 0;

  error = '';

  savingData = false;

  public constructor(
    private data: DataService,
    private dialogRef: MatDialogRef<ProfilePictureComponent>,
    private userData: UserDataService
  ) {
  }

  public ngOnInit(): void {
  }

  onFileSelected() {
    this.savingData = true;
    const formData = new FormData();
    this.data.uploadProfilePicture(this.croppedImageBase64).subscribe(
      response => {
        if (response.type === HttpEventType.UploadProgress) {
          this.imageUploadProgress = Math.round(100 * response.loaded / response.total);
        } else if (response.type === HttpEventType.Response) {
          this.dialogRef.close(false);
          this.userData.changeProfilePicture(this.croppedImageBase64);
        }
      },
      error => {
        this.error = error;
      }
    ).add(() => {
      this.savingData = false;
      this.imageUploadProgress = 0;
    });
  }

  clickFileUpload() {
    this.fileUploadClick.nativeElement.click();
  }

  fileChangeEvent(Event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBase64 = event.base64;
  }

}
