'use strict';


var preq   = require('preq');
var assert = require('../../utils/assert.js');
var server = require('../../utils/server.js');


describe('scraping', function() {

	this.timeout(40000);

	before(function () { return server.start(); });

	it('pmid', function() {
		return server.query('23555203').then(function(res) {
			assert.status(res, 200);
			assert.checkCitation(res, 'Viral Phylodynamics');
		});
	});

	it('example domain', function() {
		return server.query('example.com').then(function(res) {
			assert.status(res, 200);
			assert.checkCitation(res, 'Example Domain');
		});
	});

	it('doi', function() {
		return server.query('doi: 10.1371/journal.pcbi.1002947').then(function(res) {
			assert.status(res, 200);
			assert.checkCitation(res);
			assert.deepEqual(res.body[0].pages, 'e1002947', 'Wrong pages item; expected e1002947, got ' + res.body[0].pages);
		});
	});

	it('open graph', function() {
		return server.query('http://www.pbs.org/newshour/making-sense/care-peoples-kids/').then(function(res) {
			assert.status(res, 200);
			assert.checkCitation(res);
		});
	});

	it('websiteTitle + publicationTitle', function() {
		return server.query('http://blog.woorank.com/2013/04/dublin-core-metadata-for-seo-and-usability/').then(function(res) {
			assert.status(res, 200);
			assert.checkCitation(res);
			assert.notDeepEqual(res.body[0].websiteTitle, undefined, 'Missing websiteTitle field');
			assert.notDeepEqual(res.body[0].publicationTitle, undefined, 'Missing publicationTitle field');
		});
	});

});
