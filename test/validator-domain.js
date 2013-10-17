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

var validatorDomain = require('..').validatorDomain;
var ObjectSchema = validatorDomain.ObjectSchema;
var Type = validatorDomain.Type;
var Property = validatorDomain.Property;
var ObjectSchemaRegistry = require('..').ObjectSchemaRegistry;

var objectSchemaRegistry = new ObjectSchemaRegistry();
var getObjectSchemaType = objectSchemaRegistry.getSchemaType.bind(objectSchemaRegistry);

describe('Validator Domain', function() {

	describe('ObjectSchema', function() {
		it('must be constructed with options that have a valid namespace and version', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);
			expect(schema.namespace).to.equal(options.namespace);
			expect(schema.version).to.equal(options.version);
			expect(schema.id).to.exist;
			expect(schema.createdOn).to.exist;
			expect(schema.updatedOn).to.exist;
			expect(lodash.isString(schema.id)).to.equal(true);
			expect(lodash.isDate(schema.createdOn)).to.equal(true);
			expect(lodash.isDate(schema.updatedOn)).to.equal(true);

			console.log(schema);
		});

		it('constructor options.namespace format must match pattern: ns://namespace', function(done) {
			var options = {
				namespace : '//runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			try {
				new ObjectSchema(options);
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(1);
				done();
			}

		});

		it('constructor options.version format must match pattern: x.x.x', function(done) {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0',
				description : 'Couchbase config schema'
			};

			try {
				new ObjectSchema(options);
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(1);
				done();
			}

		});

		it('constructor options.description is required', function(done) {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0'
			};

			try {
				new ObjectSchema(options);
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(1);
				done();
			}

		});

		it('constructor options are required', function(done) {
			try {
				new ObjectSchema();
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(3);
				done();
			}
		});

		it('can list the names of Types that it contains', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);
			var typeNames = schema.getTypeNames();
			expect(lodash.size(typeNames)).to.equal(0);

			var type = new Type({
				name : 'CouchbaseConnectionSettings',
				description : 'Couchbase Connection Settings'
			});

			schema.addType(type);
			expect(schema.getType(type.name)).to.exist;
			expect(lodash.contains(schema.getTypeNames(), type.name)).to.equal(true);
		});

		it('can remove a Type by name', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);

			var type = new Type({
				name : 'CouchbaseConnectionSettings',
				description : 'Couchbase Connection Settings'
			});

			schema.addType(type);
			expect(schema.getType(type.name)).to.exist;
			expect(lodash.contains(schema.getTypeNames(), type.name)).to.equal(true);
			var removedType = schema.removeType(type.name);
			expect(removedType.name).to.equal(type.name);
		});

		it('a type with same name cannot be added twice', function(done) {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);

			var type = new Type({
				name : 'CouchbaseConnectionSettings',
				description : 'Couchbase Connection Settings'
			});

			schema.addType(type);

			try {
				schema.addType(type);
				done(new Error('expected an Error to be thrown because a type with the same name already exists'));
			} catch (err) {
				done();
			}
		});

		it('#set - will replace existing types with the same name', function() {
			var options = {
				namespace : 'ns://runrightfast.co/couchbase',
				version : '1.0.0',
				description : 'Couchbase config schema'
			};

			var schema = new ObjectSchema(options);

			var type = new Type({
				name : 'CouchbaseConnectionSettings',
				description : 'Couchbase Connection Settings'
			});

			schema.addType(type);
			var type2 = new Type({
				name : 'CouchbaseConnectionSettings',
				description : 'Couchbase Connection Settings - 2'
			});
			schema.setType(type2);
			expect(schema.getType(type.name).description).equal(type2.description);

		});
	});

	describe('Type', function() {
		it('must be constructed with a name', function(done) {
			var options = {
				name : 'CouchbaseConnectionSettings'
			};

			var type = new Type(options);
			expect(type.name).to.equal(options.name);
			expect(type.description).to.equal(options.name);
			expect(type.allowExtraKeys).to.equal(false);

			try {
				type = new Type();
				done(new Error('Expected Error to be thrown because Type requires name'));
			} catch (err) {
				done();
			}
		});

		it('must be constructed with a name, description, and allowExtraKeys', function() {
			var options = {
				name : 'CouchbaseConnectionSettings',
				description : 'Couchbase Connection Settings',
				allowExtraKeys : true
			};

			var type = new Type(options);
			expect(type.name).to.equal(options.name);
			expect(type.description).to.equal(options.description);
			expect(type.allowExtraKeys).to.equal(true);
		});
	});

	describe('Property', function() {
		it('must be constructed with a name and type', function(done) {
			var options = {
				name : 'port',
				type : 'Number'
			};

			var property = new Property(options);
			expect(property.name).to.equal(options.name);
			expect(property.description).to.equal(options.name);
			expect(property.type).to.equal(options.type);

			try {
				new Property();
				done(new Property('Expected Error to be thrown because Property requires name and type'));
			} catch (err) {
				done();
			}
		});

		it('can be constructed with type constraints', function(done) {
			var options = {
				name : 'port',
				type : 'Number',
				constraints : [ {
					method : 'min',
					args : [ 0 ]
				}, {
					method : 'max',
					args : [ 10 ]
				} ]
			};

			var property = new Property(options);
			expect(property.name).to.equal(options.name);
			expect(property.description).to.equal(options.name);
			expect(property.type).to.equal(options.type);

			try {
				new Property();
				done(new Property('Expected Error to be thrown because Property requires name and type'));
			} catch (err) {
				done();
			}
		});

		it('can be constructed with type constraints that are valid', function(done) {
			var options = {
				name : 'port',
				type : 'Number',
				constraints : [ {
					method : 'min',
					args : [ 0 ]
				}, {
					method : 'maxXXX',
					args : [ 10 ]
				} ]
			};

			try {
				new Property(options);
				done(new Property('Expected Error to be thrown because Number.maxXXX is not a valid constraint'));
			} catch (err) {
				done();
			}
		});

		it('must be constructed with a name and type that is supported', function(done) {
			var options = {
				name : 'port',
				type : 'SDFSDFF'
			};

			try {
				new Property(options);
				done(new Property('Expected Error to be thrown because type is not supported'));
			} catch (err) {
				console.log(err);
				done();
			}
		});

	});

});