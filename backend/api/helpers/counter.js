"use strict;"
const Mongoose = require("mongoose");

const schema = new Mongoose.Schema({
    _id: { type: String }, // Sequence Name, 
    prefix: {type: String},
    next: {type: Number, default: 100},
    collectionName: {type: String}, // CollectionName
    createdAt: {type: Date, default: Date.now()}
});

schema.index({collectionName: 1, prefix: 1});

const model = Mongoose.model("counter",schema);


function getCount(sequenceName = null, collectionName = null, prefix, defaultSeq=null, callback){
    let options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    };
    model.findOne({$or: [{_id : sequenceName }, { collectionName: collectionName }]}).lean().exec().then(doc=>{
        if(doc){
            model.findOneAndUpdate({_id: doc._id},{$inc: {next: 1}},{new: true, useFindAndModify: true}).exec().then(updated=>{
                callback(null,updated);
            }).catch(e => callback(e));
        }else{
            model.create({
                _id: sequenceName,
                collectionName: collectionName,
                prefix: prefix,
                next: defaultSeq || 100
            },function(err,newDoc){
                if(err) callback(err);
                else callback(null,newDoc);
            });
        }
    }).catch(e => callback(e));
}

/**
 * 
 * @param {*} prefix 
 * @param {*} sequenceName 
 * @param {*} collectionName 
 * 
 * Hook it to the prehooks
 * schema.pre("save", generateId);
 */
function generateId(prefix, sequenceName, collectionName, defaultSeq){
    return function(next){
        const self = this;
        if(!sequenceName || !collectionName ) next(new Error(`Provide either the sequence name or the collection name for the counter`));
        if(!self._id){
            getCount(sequenceName,collectionName,prefix, null,function(err,doc){
                if(err){
                    next(err);
                }else{
                    self.id = doc.prefix + doc.next;
                    next();
                }
            })
        }else{
            next();
        }
    }
}

module.exports = {
    getCount: getCount,
    generateId: generateId
} 