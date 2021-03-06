const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
require('dotenv').config()

const MONGODB_HOST = process.env.MONGODB_HOST;
const MONGODB_PORT = process.env.MONGODB_PORT;

/**
 * Mongo DB Class For Easy Command
 */
class MongoDB {
  /**
   * @constructor
   * @param databaseName
   * @param collectionName
   */
  constructor(databaseName, collectionName) {
    this.user = process.env.MONGODB_USER;
    this.pass = process.env.MONGODB_PASS;
    this.URL = `mongodb://${this.user}:${this.pass}@${MONGODB_HOST}:${MONGODB_PORT}/admin?socketTimeoutMS=1200000&connectTimeoutMS=1200000`;
    this.set(databaseName, collectionName);
  }

  /**
   * Database
   *
   * @param databaseName
   * @param collectionName
   */
  set(databaseName, collectionName) {
    this.databaseName = databaseName;
    this.setCollection(collectionName);
  }

  /**
   *
   * @param collectionName
   */
  setCollection(collectionName) {
    this.collectionName = collectionName;
  }

  /**
   * Verilen json datasını db ye ekler.
   *
   * @param data
   * @returns {Promise<boolean>}
   */
  insert(data) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, {  useUnifiedTopology: true, useNewUrlParser: true  }, (error, client) => {
        if (error != null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .insertOne(data, (error, result) => {
            if (error !== null) {
              reject(false);
              this.error = 'Error insert object to collection';
            }

            resolve(data._id);
            client.close();
          });
      });
    });
  }

  /**
   * Verilen json datasını db ye ekler.
   *
   * @param data
   * @returns {Promise<boolean>}
   */
  insertMany(data) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, {  useUnifiedTopology: true, useNewUrlParser: true  }, (error, client) => {
        if (error != null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .insertMany(data, (error, result) => {
            if (error !== null) {
              reject(false);
              this.error = 'Error insert object to collection';
            }

            resolve(data._id);
            client.close();
          });
      });
    });
  }

  /**
   *
   * @param query
   * @param data
   * @returns {Promise<any>}
   */
  update(query, data, Objectid=true, upsert=false) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        if (error != null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }
        if(Objectid){
          query = { _id: ObjectId(query) };
        }
        if(upsert){
          upsert = {upsert: true};
        }else{
          upsert = {upsert: false};
        }
        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .updateOne(query, data, upsert, (error, result) => {
            if (error !== null) {
              reject(false);
              this.error = 'Error insert object to collection';
            }
            resolve(result.matchedCount === 1 && result.modifiedCount === 1);
            client.close();
          });
      });
    });
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  find(data) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        if (error !== null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .find(data)
          .toArray((error, docs) => {
            if (error !== null) {
              reject(error);
              this.error = 'Error find any object to collection';
            }

            resolve(docs);
            client.close();
          }); // end of collection
      });
    });
  }
 
  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  findSiteMap(data, skip=0, limit=50) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        if (error !== null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .find(data)
          .sort({_id: 1})
          .skip(skip)
          .limit(limit)
          .toArray((error, docs) => {
            if (error !== null) {
              reject(error);
              this.error = 'Error find any object to collection';
            }

            resolve(docs);
            client.close();
          }); // end of collection
      });
    });
  }
 
  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  count(data={}) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        if (error !== null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .find(data)
          .count((error, docs) => {
            if (error !== null) {
              reject(error);
              this.error = 'Error find any object to collection';
            }

            resolve(docs);
            client.close();
          })
      });
    });
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  findWithProject(data, limit=[0,15], project={}, sort={}) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        if (error !== null) {
          reject(false);
          this.error = 'Not connected correctly to db!';
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .find(data)
          .sort(sort)
          .skip(limit[0])
          .limit(limit[1])
          .project(project)
          .toArray((error, docs) => {
            if (error !== null) {
              reject(error);
              this.error = 'Error find any object to collection';
            }

            resolve(docs);
            client.close();
          }); // end of collection
      });
    });
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  aggregate(data) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true,  poolSize: 10 }, (error, client) => {
        if (error !== null) {
          reject('Not cnnected correctly to server! ORG'+error);
        }

        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .aggregate(data, (error, cursor) => {
            if (error !== null) {
              reject('Error insert mant object to collection');
            }
            cursor.toArray(function(err, documents) {
              resolve(documents);
              client.close();
            });
          });
      });
    });
  }

  query(query) {
    if (this.match === undefined) {
      return this.aggregate(query);
    }

    return this.aggregate([this.match, ...query]);
  }

  setDates(dateStart, dateEnd) {
    this.match = {
      $match: {
        date: {
          $gte: dateStart,
          $lte: dateEnd
        }
      }
    };
  } // End of function

  /**
   *
   * @param query
   * @returns {Promise<any>}
   */
  delete(query) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        if (error !== null) {
          reject('Not cnnected correctly to server!'+error);
        }
        client
          .db(this.databaseName)
          .collection(this.collectionName)
          .deleteMany(query, (error, obj) => {
            if (error !== null) {
              console.log(error)
            }
            resolve(true);

            client.close();
          });
      });
    });
  }
}

module.exports = MongoDB;
