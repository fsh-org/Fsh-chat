/* ---- pls no deleted I need to feed my family ---- */

// Import fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Create Basket class (for a little bit more organized)
class Basket {
	constructor(pantryID, basePath) {
		this.pantryID = pantryID;
		this.basePath = basePath;
	}
	
	/**
	 * Create or full replace a basket
	 *
	 * @param {string} basketName - Basket to use
	 * @param {Object} payload - Data to set basket to
	 * @return {string} Returns "Your Pantry was updated with basket: basket"
	 */
	async create(basketName, payload = {}){
		try{
			const response = await fetch(`${this.basePath}${this.pantryID}/basket/${basketName}`, {
				method: 'post',
				body: JSON.stringify(payload),
				headers: {'Content-Type': 'application/json'}
			})
			return await response.text();
		} catch (err){
			console.log(err)
			return {}
		}
	}
	
	/**
	 * Get data from a basket
	 *
	 * @param {string} basketName - Basket to use
	 * @return {Object} Returns basket data
	 */
	async get(basketName){
		try{
			const response = await fetch(`${this.basePath}${this.pantryID}/basket/${basketName}`)
			return await response.json();
		} catch (err){
			console.log(err)
			return {}
		}
	}

	/**
	 * Basically a push
	 *
	 * @example
	 * // current db: {"thing": {"one": 2}, "list": [{"ready": true}]}
	 * basket.update("example", {"thing": {"two": 1, "one": 3}, "list": [{"ready": false}]});
	 * // new db: {"thing": {"one": 3, "two": 1}, "list": [{"ready": true},{"ready": false}]}}
	 * 
	 * @param {string} basketName - Basket to use
	 * @param {Object} payload - Data to append to basket
	 * @return {Object} Returns new basket data
	 */
	async update(basketName, payload = {}){
		try{
			const response = await fetch(`${this.basePath}${this.pantryID}/basket/${basketName}`, {
				method: 'put',
				body: JSON.stringify(payload),
				headers: {'Content-Type': 'application/json'}
			})
			return await response.json();
		} catch (err){
			console.log(err)
			return {}
		}
	}

	/**
	 * Delete a basket
	 *
	 * @param {string} basketName - Basket to use
	 * @return {string} Returns "basket was removed from your Pantry!"
	 */
	async delete(basketName){
		try{
			const response = await fetch(`${this.basePath}${this.pantryID}/basket/${basketName}`, {
				method: 'delete',
				body: '',
				headers: {'Content-Type': 'application/json'}
			}))
			return await response.text();
		} catch (err){
			console.log(err)
			return ""
		}
	}
}

// Create pantry class
class Pantry{
	constructor(
		pantryID,
		basePath = 'https://getpantry.cloud/apiv1/pantry/'
	) {
		this.pantryID = pantryID;
		this.basePath = basePath;
		this.basket = new Basket(this.pantryID, this.basePath);
	}
	/**
	 * Get pantry details
	 *
	 * @return {string} {
  		"name": "Postman_Account",
  		"description": "Postman test account",
		  "errors": [],
		  "notifications": true,
		  "percentFull": 1,
		  "baskets": [
		    {
		      "name": "Postman_Basket",
		      "ttl": 258915
		    }
		  ]
		}
	 *
	 */
	async details(){
		try{
			let response = await fetch(`${this.basePath}${this.pantryID}`);
			return await response.json();
		} catch (err) {
			console.log(err);
			return {}
		}
	}
}

// Export Pantry class
module.exports = Pantry