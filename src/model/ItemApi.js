'use strict';


/**
 * Model layer API functions for the {@link Item} class (used by GSJS
 * code). These functions are attached to `Item.prototype` at server
 * startup.
 *
 * @mixin
 */
var ItemApi = module.exports = function ItemApi() {};


/**
 * Retrieves the object that determines the actual position of this
 * item in its current location. This has three cases:
 *
 * * item is in player's inventory: returns player object
 * * item is in location, outside of any bags: return the item itself
 * * item is in a bag within a location: return the top-level bag
 *
 * @returns {Player|Bag|Item} the game object that determines the
 *          item's actual x/y position, or `undefined` if no such
 *          object exists (e.g. while the item is being created)
 */
ItemApi.prototype.apiGetLocatableContainerOrSelf =
	function apiGetLocatableContainerOrSelf() {
	log.trace('%s.apiGetLocatableContainerOrSelf()', this);
	return this.getPosObject();
};


ItemApi.prototype.apiPutBack = function apiPutBack() {
	log.trace('%s.apiPutBack', this);
	//TODO: implement&document me
};


ItemApi.prototype.apiSetHitBox = function apiSetHitBox(w, h) {
	log.debug('%s.apiSetHitBox(%s, %s)', this, w, h);
	//TODO: implement&document me
	log.warn('TODO Item.apiSetHitBox not implemented yet');
};


ItemApi.prototype.apiAddHitBox = function apiAddHitBox(name, w, h) {
	log.debug('%s.apiAddHitBox(%s, %s, %s)', this, name, w, h);
	//TODO: implement&document me
	log.warn('TODO Item.apiAddHitBox not implemented yet');
};


ItemApi.prototype.apiRemoveHitBox = function apiRemoveHitBox(name) {
	log.debug('%s.apiRemoveHitBox(%s)', this, name);
	//TODO: implement&document me
	log.warn('TODO Item.apiRemoveHitBox not implemented yet');
};


/**
 * En/disable collision detection with players for this item.
 *
 * @param {boolean} enable
 */
ItemApi.prototype.apiSetPlayersCollisions = function
	apiSetPlayersCollisions(enable) {
	log.debug('%s.apiSetPlayersCollisions(%s)', this, enable);
	this.collDet = enable;
};


/**
 * Sets the item's coordinates within its current location.
 *
 * @param {number} x
 * @param {number} y
 */
ItemApi.prototype.apiSetXY = function apiSetXY(x, y) {
	log.trace('%s.apiSetXY(%s, %s)', this, x, y);
	this.setXY(x, y);
};


/**
 * Splits off a given amount from the item into a new item.
 * Only works for stackable items. If the specified amount equals or
 * exceeds the available stack size, no split is performed.
 *
 * @param {number} n the amount to split off
 * @returns {Item} a new item with count `n`, or `null` if the
 *          desired split is not possible
 */
ItemApi.prototype.apiSplit = function apiSplit(n) {
	log.debug('%s.apiSplit(%s)', this, n);
	return this.split(n) || null;
};


/**
 * Transfers the given amount from another item to this item; if this
 * reduces the other item's count to 0, it is scheduled for deletion.
 * Only works for stackable items, and handles invalid arguments
 * gracefully (not performing any merging) as far as possible.
 *
 * @param {Item} otherItem item to merge *from*
 * @param {number} n amount to transfer
 * @returns {number} amount actually transferred
 */
ItemApi.prototype.apiMerge = function apiMerge(otherItem, n) {
	log.debug('%s.apiMerge(%s, %s)', this, otherItem, n);
	return this.merge(otherItem, n);
};


/**
 * Decreases the item count by `n` (or by `count`, if `n > count`).
 * If the count is 0 afterwards, the item is flagged for deletion.
 *
 * @param {number} n the amount to decrease the item count by
 * @returns {number} actual amount of consumed items
 */
ItemApi.prototype.apiConsume = function apiConsume(n) {
	log.debug('%s.apiConsume(%s)', this, n);
	return this.consume(n);
};


/**
 * Tests whether the item is flagged for deletion.
 *
 * @returns {boolean} `true` if the item is flagged for deletion
 */
ItemApi.prototype.apiIsDeleted = function apiIsDeleted() {
	log.debug('%s.apiIsDeleted()', this);
	return this.deleted;
};


/**
 * Starts an item moving toward a given position via walking.
 *
 * TODO: this function both finds a path and moves the item there. If
 * called with a flag value of 1 and a destination point that isn't
 * reachable, it will return false immediately and not call the
 * callback.
 *
 * This function will return false if the destination is too
 * close to the start point (closer than about 10 units).
 *
 * @param {number} x x position of the destination
 * @param {number} y y position of the destination
 * @param {number} flags contains a bitmask of options which affect movement
 * @param {string} callback the name of the function called on movement events
 * @returns {boolean} `true` if the item can start moving
 */
ItemApi.prototype.apiFindPath = function apiFindPath(x, y, flags, callback) {
	log.debug('%s.apiFindPath(%s, %s, %s, %s)', this, x, y, flags, callback);
	return this.startMoving('walking', {x: x, y: y},
		{flags: flags, callback: callback});
};


/**
 * Stop the existing movement of an item.
 *
 * @returns {boolean} `true`
 */
ItemApi.prototype.apiStopMoving = function apiStopMoving() {
	log.debug('%s.apiStopMoving()', this);
	this.stopMoving();
	return true;
};


/**
 * start butterfly movements in the area.
 *
 * @param {number} x left bound of the fly box
 * @param {number} y top bound of the fly box
 * @param {number} w width of the fly box
 * @param {number} h height of the fly box
 * @returns {boolean} `true` if the item can start moving
 */
ItemApi.prototype.apiStartFlyingInTheArea = function apiStartFlyingInTheArea(x, y, w, h) {
	log.debug('%s.apiStartFlyingInTheArea(%s, %s, %s, %s)', this, x, y, w, h);
	return this.apiStartFlyingInTheAreaX(x, y, w, h, 90, true);
};


/**
 * start butterfly movements in the area.
 *
 * @param {number} x left bound of the fly box
 * @param {number} y top bound of the fly box
 * @param {number} w width of the fly box
 * @param {number} h height of the fly box
 * @param {number} speed speed of the movment in px/sec
 * @returns {boolean} `true` if the item can start moving
 */
/*jshint -W072 */  // suppress "too many parameters" warning (API function following the spec)
ItemApi.prototype.apiStartFlyingInTheAreaX = function apiStartFlyingInTheAreaX(
		x, y, w, h, speed, changeState) {
	log.debug('%s.apiStartFlyingInTheArea(%s, %s, %s, %s, %s, %s)', this, x,
	y, w, h, speed, changeState);

	/* Build a the random flight area */
	return this.startMoving('flying', {left: x, right: x + w, width: w,
		top: y, height: h}, {changeState: changeState, speed: speed,
		stopAtEnd: false});
};
/*jshint +W072 */


/*
 *  Start butterfly movements from current position to a point.
 *
 * @param {number} x x position of the movement target
 * @param {number} y y position of the movement target
 * @param {number} speed speed of the movment in px/sec
 * @param {string} callBack the name of the function called on movement events
 * @returns {boolean} `true` if the item can start moving
 */
ItemApi.prototype.apiStartFlyingTo = function apiStartFlyingTo(x, y, speed, callBack) {
	log.debug('%s.apiStartFlyingTo(%s, %s, %s, %s)', this, x, y, speed,
		callBack);

	// Build a targeted flight path
	return this.startMoving('flying', {x: x, y: y}, {callback: callBack,
speed: speed, stopAtEnd: true});
};


/**
 * Start chicken like movement.
 *
 * @param {number} vx velocity of the x movment
 * @param {number} vy velocity of the y movment
 * @returns {boolean} `true` if the item can start moving
 */
ItemApi.prototype.apiKickTheChicken = function apiKickTheChicken(vx, vy) {
	log.debug('%s.apiKickTheChicken(%s, %s)', this, vx, vy);
	this.startMoving('kicked', {}, {vx: vx, vy: vy,
		callback: 'movementCallback'});
	return true;
};


/**
 * Start direct motion of the item to a point.
 *
 * @param {number} x x position of target point
 * @param {number} y y position of target point
 * @param {number} v velocity of the movment in px/sec
 * @param {number} callBackFuncName name of function called on arrival
 * @param {number} callBackParam params to callback function when called
 * @returns {boolean} `true` if the item can start moving
 */
ItemApi.prototype.apiMoveToXY = function apiMoveToXY(x, y, v, callBackFuncName,
		callBackParam) {
	log.debug('%s.apiMoveToXY(%s, %s, %s)', this, x, y, v);
	return this.startMoving('direct', {x: x, y: y},
		{callBackParam: callBackParam, callback: callBackFuncName,
		 speed: v});
};


ItemApi.prototype.apiStartFlyingAndFollow = function apiStartFlyingAndFollow(pc, radius) {
	log.debug('%s.apiStartFlyingAndFollow(%s, %s)', this, pc, radius);
	log.warn('TODO Item.apiStartFlyingAndFollow not implemented yet');
};
