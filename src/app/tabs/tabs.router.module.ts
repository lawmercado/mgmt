import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'expenses',
        children: [
          {
            path: '',
            loadChildren: '../expenses/expenses.module#ExpensesPageModule'
          }
        ]
      },
      {
        path: 'goals',
        children: [
          {
            path: '',
            loadChildren: '../goals/goals.module#GoalsPageModule'
          }
        ]
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadChildren: '../categories/categories.module#CategoriesPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/expenses',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/expenses',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
