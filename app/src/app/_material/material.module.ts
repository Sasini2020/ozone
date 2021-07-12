import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatStepperModule} from '@angular/material/stepper';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatChipsModule} from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MaterialFileInputModule} from 'ngx-material-file-input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatPaginatorModule} from '@angular/material/paginator';

const Material = [
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatInputModule,
  MatCheckboxModule,
  MatStepperModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatListModule,
  MatSidenavModule,
  MatExpansionModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatSortModule,
  MatChipsModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatSelectModule,
  MatProgressBarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MaterialFileInputModule,
  MatRadioModule,
  MatSnackBarModule,
  MatBadgeModule,
  MatPaginatorModule
];

@NgModule({
  imports: [Material],
  exports: [Material]
})

export class MaterialModule {
}
