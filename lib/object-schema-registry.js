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
'use strict';

var lodash = require('lodash');
var joi = require('joi');
var Hoek = require('hoek');
var assert = Hoek.assert;
var ObjectSchema = require('./validator-domain').ObjectSchema;
var utils = require('./utils');

/**
 * @param impl
 *            OPTIONAL - the ObjectSchemaRegistry implementation to delegate to.
 *            If none is provided, then an in-memory default implementation is
 *            provided. The default in-memory implementation is only meant to be
 *            used for unit testing purposes.
 */
var ObjectSchemaRegistry = function(impl) {
	if (lodash.isUndefined(impl)) {
		this.impl = {
			schemas : {},
			getSchemaType : function(params) {
				var schema = this.schemas[params.namespace + params.version];
				return schema ? schema.getType(params.type) : undefined;
			},
			registerSchema : function(objectSchema) {
				assert(lodash.isObject(objectSchema), 'objectSchema is required');
				this.schemas[objectSchema.namespace + objectSchema.version] = new ObjectSchema(objectSchema);
			}
		};
	} else {
		var schema = {
			getSchemaType : joi.types.Function().required(),
			registerSchema : joi.types.Function().required(),
			allowExtraKeys : true
		};

		utils.validate(impl, schema);
		this.impl = impl;
	}

};

ObjectSchemaRegistry._getSchemaType_params_schema = {
	namespace : joi.types.String().regex(/ns:\/\/[\w\W]+/).required(),
	version : joi.types.String().regex(/\d+\.\d+\.\d+/).required(),
	type : joi.types.String().required()
};

ObjectSchemaRegistry.validate_getSchemaType_args = function(args) {
	utils.validate(args, ObjectSchemaRegistry._getSchemaType_params_schema);
};

/**
 * 
 * @param params
 *            an object with the following properties:
 * 
 * <code>
 * namespace			REQUIRED - String - e.g., ns://runrightfast.co/security
 * version				REQUIRED - String - follows semver semantics, e.g., 1.0.0
 * type					REQUIRED - String - the type name 
 * </code>
 * 
 * @returns ObjectSchema
 */
ObjectSchemaRegistry.prototype.getSchemaType = function(params) {
	ObjectSchemaRegistry.validate_getSchemaType_args(params);
	return this.impl.getSchemaType(params);
};

ObjectSchemaRegistry.prototype.registerSchema = function(objectSchema) {
	return this.impl.registerSchema(objectSchema);
};

module.exports = ObjectSchemaRegistry;
