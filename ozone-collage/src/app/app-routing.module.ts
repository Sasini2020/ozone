import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ClassesComponent } from './classes/classes.component';
import { HomeComponent } from './home/home.component';
import { StaffComponent } from './staff/staff.component';

const routes: Routes = [

{path:'',component:HomeComponent},
{path:'about',component:AboutComponent},
{path:'classes',component:ClassesComponent},
{path:'staff',component:StaffComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
