'use strict';

/**
 * Dependencies
 */
const _ = require('lodash');

const voidValidate = function validate(__, ___, next) {
  console.log("voidValidate")
  next();

};

/**
 * Mongoose plugin, add possibility to create draft to disable the model validation
 *
 * @param {Object} schema Mongoose schema
 * @param {Options} [options] Additional options for draft field
 *   @property {Boolean} [isDraft] Set the initial value, default `true`
 *   @property {String} [fieldName] Set fieldName value, use it only is you're already using the default value somewhere else, default `_is_draft`
 */
function draft(schema, options) {
  const fieldName = options && options.fieldName ? options.fieldName : '_is_draft';
  const defaultVal = options && _.isBoolean(options.isDraft) ? options.isDraft : true;
  const fieldSchema = {};

  fieldSchema[fieldName] = {
    'type': Boolean,
    'require': true,
    'default': defaultVal,
  };

  schema.add(fieldSchema);

  function setIsDraft(isDraft) {
    this[fieldName] = isDraft;
  }

  schema.virtual('isDraft')
    .get(function _getIsDraft() {
      return this[fieldName];
    })
    .set(function _setIsDraft(isDraft) {
      this[fieldName] = isDraft;

      return this[fieldName];
    });

  if (!schema.methods.hasOwnProperty('setIsDraft')) {
    schema.methods.setIsDraft = setIsDraft;
  }

  schema.path(fieldName).set(function _setIsDraft(isDraft) {
    if (!_.isUndefined(this._default_validate) && isDraft === false) {
      const keys = _.difference(_.keys(_.get(this, 'schema.paths')), ['_id', '__v', fieldName]);
      keys.forEach((key) => {
        if (!_.isUndefined(this.get(key))) {
          _.set(this , '$__.activePaths.states.modify.' + key, true);
        }
      });
      this.$__validate = this._default_validate;
    }
    return isDraft;
  });

  schema.pre('validate', function preValidate(next) {
    if (_.isUndefined(this._default_validate)) {
      this._default_validate = this.$__validate;
    }
    console.log("pre-validate")
    
    throw new Error("here");
    if (this.isDraft) {
      console.log("pre-validate isDraft")
      console.log(this.$__validate)

      // this.$__validate = function()
      // this.$__validate = function(next) {
      //   console.log("hello")
      //   next()
      // }
      // this.$__validate = function(next) {
      //   console.log("inside $__validate")
      //   next()
      // };
    }
    next();
  });
}

module.exports = draft;
