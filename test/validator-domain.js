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

describe('Validator Domain', function() {

	describe('ObjectScehma', function() {
		it('must be constructed with options that have a valid namespace and version', function() {
			var ObjectSchema = validatorDomain.ObjectSchema;

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
			var ObjectSchema = validatorDomain.ObjectSchema;

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
			var ObjectSchema = validatorDomain.ObjectSchema;

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
			var ObjectSchema = validatorDomain.ObjectSchema;

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
			var ObjectSchema = validatorDomain.ObjectSchema;

			try {
				new ObjectSchema();
				done(new Error('expected validation error'));
			} catch (err) {
				console.log(err);
				expect(err._errors.length).to.equal(3);
				done();
			}

		});
	});

});