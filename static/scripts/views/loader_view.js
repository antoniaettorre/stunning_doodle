import {View} from "./view.js";

 class LoaderView extends View{
  show(){
   this.$el.addClass('show');
  }
  hide(){
   this.$el.removeClass('show');
  }
 }

 export {LoaderView}
