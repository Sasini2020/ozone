import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ClassComponent } from './class/class.component';
import { ContactusComponent } from './contactus/contactus.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ClassregistrationComponent } from './classregistration/classregistration.component';
import { TeachersComponent } from './teachers/teachers.component';


const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'class',component:ClassComponent},
  {path:'login',component:LoginComponent},
  {path:'about',component:AboutComponent},
  {path:'contactus',component:ContactusComponent},
  {path:'register',component:RegisterComponent},
  {path:'classregistration',component:ClassregistrationComponent},
  {path:'teachers',component:TeachersComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
