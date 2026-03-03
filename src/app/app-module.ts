import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// CHANGED: Importing 'App' from './app' instead of 'AppComponent'
import { App } from './app';

@NgModule({
  declarations: [App], // CHANGED: App
  imports: [BrowserModule, FormsModule, BrowserAnimationsModule],
  providers: [],
  bootstrap: [App], // CHANGED: App
})
export class AppModule {}
