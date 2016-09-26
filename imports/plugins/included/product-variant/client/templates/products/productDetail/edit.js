import autosize from "autosize";
import { Reaction, i18next, Logger } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

/**
 * productDetailEdit helpers
 */

Template.productDetailEdit.helpers({
  i18nPlaceholder: function () {
    let i18nKey = `productDetailEdit.${this.field}`;
    if (i18next.t(i18nKey) === i18nKey) {
      Logger.info(`returning empty placeholder productDetailEdit: ${i18nKey} no i18n key found.`);
    } else {
      return i18next.t(i18nKey);
    }
  }
});

/**
 * productDetailEdit events
 */

Template.productDetailEdit.events({
  "click #submitdescription":function(event){
    const productId = ReactionProduct.selectedProductId();
    var html = $('#description').summernote('code');
    Meteor.call("products/updateProductField", productId, "description",html);
  },
  "change input,textarea": function (event) {
    const self = this;
    const productId = ReactionProduct.selectedProductId();
    Meteor.call("products/updateProductField", productId, self.field,
      $(event.currentTarget).val(),
      (error, result) => {
        if (error) {
          return Alerts.inline(error.reason, "error", {
            placement: "productManagement",
            i18nKey: "productDetail.errorMsg",
            id: self._id
          });
        }
        if (result) {
          // redirect to new url on title change
          if (self.field === "title") {
            Meteor.call("products/setHandle", productId,
              (err, res) => {
                if (err) {
                  Alerts.inline(err.reason, "error", {
                    placement: "productManagement",
                    i18nKey: "productDetail.errorMsg",
                    id: self._id
                  });
                }
                if (res) {
                  Reaction.Router.go("product", {
                    handle: res
                  });
                }
              }
            );
          }
          // animate updated field
          // TODO this needs to be moved into a component
          return $(event.currentTarget).animate({
            backgroundColor: "#e2f2e2"
          }).animate({
            backgroundColor: "#fff"
          });
        }
      });

    if (this.type === "textarea") {
      autosize($(event.currentTarget));
    }

    return Session.set("editing-" + this.field, false);
  }
});

/**
 * productDetailField events
 */

Template.productDetailField.events({
  "click .product-detail-field": function () {
    if (Reaction.hasPermission("createProduct")) {
      let fieldClass = "editing-" + this.field;
      Session.set(fieldClass, true);
      // Tracker.flush();
      return $(`.${this.field}-edit-input`).focus();
    }
  }
});

/**
 * productDetailEdit onRendered
 */

Template.productDetailEdit.onRendered(function () {
    $(document).ready(function() {
      $('#description').summernote();
    });
});
