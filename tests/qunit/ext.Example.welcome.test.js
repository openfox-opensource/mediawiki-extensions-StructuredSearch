// QUnit.module( 'ext.StructuredSearch.welcome', {
// 	beforeEach: function () {
// 		this.conf = mw.config.values;
// 		mw.config.values = {
// 			wgStructuredSearchWelcomeColorDays: {
// 				tuesday: 'pink'
// 			},
// 			wgStructuredSearchWelcomeColorDefault: '#ccc'
// 		};
// 	},
// 	afterEach: function () {
// 		mw.config.values = this.conf;
// 	}
// } );

// QUnit.test( 'getColorByDate()', function ( assert ) {
// 	var welcome = require( 'exat.StructuredSearch.welcome' );
// 	assert.strictEqual( welcome.getColorByDate( 'monday' ), '#ccc', 'default' );
// 	assert.strictEqual( welcome.getColorByDate( 'tuesday' ), 'pink', 'custom' );
// } );
