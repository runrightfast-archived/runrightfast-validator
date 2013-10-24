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

var expect = require('chai').expect;
var lodash = require('lodash');

var ObjectSchemaRegistry = require('..').ObjectSchemaRegistry;
var objectSchemaRegistry = new ObjectSchemaRegistry();
var getObjectSchemaType = objectSchemaRegistry.getSchemaType.bind(objectSchemaRegistry);

var validatorDomain = require('..').validatorDomain;
var ObjectSchema = validatorDomain.ObjectSchema;
var Type = validatorDomain.Type;
var Property = validatorDomain.Property;
var utils = require('..').utils;

describe('ObjectSchemaRegistry', function() {
	it('provide a default in memory implementation', function() {
		var registry = new ObjectSchemaRegistry();

		var objectSchema = new ObjectSchema({
			namespace : 'ns://runrightfast.co',
			version : '1.1.1',
			description : 'RunRightFast Object Schema',
			types : {
				ConnectionConfig : {}
			}
		});
		registry.registerSchema(objectSchema);
		var type = registry.getSchemaType({
			namespace : objectSchema.namespace,
			version : objectSchema.version,
			type : 'ConnectionConfig'
		});
		expect(type).to.exist;
		console.log(type);
	});

	it('an implementation can be provided', function() {
		var registry = new ObjectSchemaRegistry(new ObjectSchemaRegistry());

		var objectSchema = new ObjectSchema({
			namespace : 'ns://runrightfast.co',
			version : '1.1.1',
			description : 'RunRightFast Object Schema',
			types : {
				ConnectionConfig : {}
			}
		});
		registry.registerSchema(objectSchema);
		var type = registry.getSchemaType({
			namespace : objectSchema.namespace,
			version : objectSchema.version,
			type : 'ConnectionConfig'
		});
		expect(type).to.exist;
		console.log(type);
	});

	it('checks that the provided implementation satisfies the ObjectSchemaRegistry interface', function(done) {
		try {
			new ObjectSchemaRegistry({});
			done(new Error('Expected an Error because the impl is not valid'));
		} catch (err) {
			console.log(err);
			done();
		}

	});
});