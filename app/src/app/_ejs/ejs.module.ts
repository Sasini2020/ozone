import {NgModule} from '@angular/core';
import {TooltipModule} from '@syncfusion/ej2-angular-popups';
import {GanttModule} from '@syncfusion/ej2-angular-gantt';
import {ScheduleModule} from '@syncfusion/ej2-angular-schedule';

const ejs = [
  TooltipModule,
  GanttModule,
  ScheduleModule,
  TooltipModule
];

@NgModule({
  imports: [ejs],
  exports: [ejs]
})

export class EjsModule {
}
