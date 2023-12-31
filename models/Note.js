const mongoose = require("mongoose");
// const AutoIncrement = require("mongoose-sequence")(mongoose);
const { autoIncrement } = require("mongoose-plugin-autoinc");

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// create a separate collections - counter, which tracks this sequential number and insert into notes
// NoteSchema.plugin(AutoIncrement, {
//   inc_field: "ticket",
//   id: "ticketNums",
//   start_seq: 500,
// });
NoteSchema.plugin(autoIncrement, {
  model: "Note",
  field: "ticketNums",
  startAt: 500,
});

module.exports = mongoose.model("Note", NoteSchema);
