/**
 * Copyright [2013] [runrightfast.co]
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

(function() {
	'use strict';

	var Entity = require('runrightfast-commons').Entity;
	var util = require('util');
	var Joi = require('joi');
	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;

	var validate = function validate(obj, schema) {
		var error = Joi.validate(obj, schema);
		if (error) {
			throw error;
		}
	};

	var validateProperty = function validateType(obj) {
		var schema = {
			name : Joi.types.String().regex(/\w+/).required(),
			description : Joi.types.String(),
			type : Joi.types.String().required(),
			constraints : Joi.types.Array()
		};
		validate(obj, schema);
		assert(lodash.isFunction(Joi.types[obj.type]), 'Unsupported type: ' + obj.type);
		if (obj.constraints) {
			var type = Joi.types[obj.type]();
			lodash.forEach(obj.constraints, function(c) {
				if (c.method === 'objectSchemaType') {
					// TODO
					throw new Error('NOT YET IMPLEMENTED');
				} else {
					type = type[c.method].apply(type, c.args);
				}
			});
		}
	};

	var validateType = function validateType(obj) {
		var schema = {
			name : Joi.types.String().regex(/\w+/).required(),
			description : Joi.types.String(),
			allowOtherKeys : Joi.types.Boolean(),
			properties : Joi.types.Object()
		};
		validate(obj, schema);
		if (obj.properties) {
			lodash.keys(obj.properties).forEach(function(key) {
				validateProperty(obj.properties[key]);
			});
		}
	};

	var validateObjectSchema = function validateObjectSchema(obj) {
		var schema = {
			namespace : Joi.types.String().regex(/ns:\/\/.+/).required(),
			version : Joi.types.String().regex(/\d+.\d+.\d+/).required(),
			description : Joi.types.String().required(),
			types : Joi.types.Object()
		};
		validate(obj, schema);
		if (obj.types) {
			lodash.keys(obj.types).forEach(function(key) {
				validateType(obj.types[key]);
			});
		}
	};

	var ObjectSchema = function ObjectSchema(options) {
		Entity.call(this, options);
		validateObjectSchema(options);
		this.namespace = options.namespace;
		this.version = options.version;
		this.description = options.description;
		this.types = options.types || {};
	};

	util.inherits(ObjectSchema, Entity);

	ObjectSchema.prototype.getTypeNames = function() {
		return lodash.keys(this.types);
	};

	ObjectSchema.prototype.getType = function(name) {
		assert(lodash.isString(name), 'name is required and must be a String');
		return this.types[name];
	};

	/**
	 * 
	 * @param type
	 * @throws Error
	 *             if type with the same name already exists
	 */
	ObjectSchema.prototype.addType = function(type) {
		validateType(type);
		if (this.types[type.name]) {
			throw new Error('type already exists: ' + JSON.stringify(this.types[type.name]));
		}
		this.types[type.name] = type;
	};

	/**
	 * removes the specified type from the schema
	 * 
	 * @param name
	 * @returns type that was removed or undefined if type did not exist
	 */
	ObjectSchema.prototype.removeType = function(name) {
		assert(lodash.isString(name), 'name is required and must be a String');
		var preExistingType = this.types[name];
		delete this.types[name];
		return preExistingType;
	};

	/**
	 * If a type with the same name already exists, then it will be replaced.
	 * Otherwise, it adds the new type.
	 * 
	 * @param type
	 * @returns the pre-existing type or undefined
	 */
	ObjectSchema.prototype.setType = function(type) {
		validateType(type);
		var preExistingType = this.types[type.name];
		this.types[type.name] = type;
		return preExistingType;
	};

	var Type = function Type(options) {
		validateType(options);
		this.name = options.name;
		this.description = options.description || this.name;
		this.allowOtherKeys = !!options.allowOtherKeys;
		this.properties = options.properties || {};
	};

	Type.prototype.validate = function(obj) {

	};

	Type.prototype.getSchema = function(obj) {
		var schema = {};
		lodash.forEach(this.properties, function(prop) {
			var propertyType = Joi.types[prop.type];
			// schema[prop.name] = ;
		});
		return schema;
	};

	var Property = function Property(options) {
		validateProperty(options);
		this.name = options.name;
		this.description = options.description || this.name;
		this.type = options.type;
		// where each constraint is an object of the form
		// {method:'method',args:[]}
		this.constraints = options.constraints || [];
	};

	module.exports = {
		ObjectSchema : ObjectSchema,
		Type : Type,
		Property : Property
	};

}());
