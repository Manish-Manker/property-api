import mongoose from "mongoose";

const propertySchema = mongoose.Schema(
  {
    property_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    size:{
      type: String,
      required: true,
    },
    typeof_size:{
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    total: {
      type: String,
      required: true,
    },
    status:{
      type : String,
      required:true,
    },
    custumer_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const property = mongoose.model("Property", propertySchema);
  
export default property;
