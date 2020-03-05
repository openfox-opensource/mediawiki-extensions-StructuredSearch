// QUnit.module( 'ext.FennecAdvancedSearch.welcome', {
// 	beforeEach: function () {
// 		this.conf = mw.config.values;
// 		mw.config.values = {
// 			wgFennecAdvancedSearchWelcomeColorDays: {
// 				tuesday: 'pink'
// 			},
// 			wgFennecAdvancedSearchWelcomeColorDefault: '#ccc'
// 		};
// 	},
// 	afterEach: function () {
// 		mw.config.values = this.conf;
// 	}
// } );

// QUnit.test( 'getColorByDate()', function ( assert ) {
// 	var welcome = require( 'exat.FennecAdvancedSearch.welcome' );
// 	assert.strictEqual( welcome.getColorByDate( 'monday' ), '#ccc', 'default' );
// 	assert.strictEqual( welcome.getColorByDate( 'tuesday' ), 'pink', 'custom' );
// } );
