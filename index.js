"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config({ path: "./auth.env" });
const signale_1 = require("signale");
const twitch_js_1 = __importDefault(require("twitch-js"));
const FS = __importStar(require("fs"));
class TwitchMassBan {
    constructor() {
        this._self = this;
        this.Logger = new signale_1.Signale({ interactive: true });
        this.Twitch = new twitch_js_1.default(this.getOptions());
        this.options = {
            token: process.env.TWITCH_OAUTH,
            username: process.env.TWITCH_USERNAME,
        };
        this.flags = {
            channel: "",
            list: "",
        };
        this.readFlags().then(() => {
            this.Logger.success("Read command line flags!");
            this.Logger.pending("Connecting to Twitch Chat...");
            this.Twitch.chat.connect();
            this.Logger.success("Connected to Twitch!");
            this.Logger.await("Processing...");
            this.Logger.time("ban");
            this.process();
            this.Logger.complete(`Done. Took ${this.Logger.timeEnd("ban")}`);
        });
    }
    getOptions() {
        return this.options;
    }
    async readFlags() {
        process.argv.forEach((value, index, array) => {
            switch (value) {
                case "-c":
                    this.flags.channel = array[index + 1];
                case "-l":
                    this.flags.list = array[index + 1];
                default:
                    this.Logger.error("Missing required flags. -c channel -l listOfUsernames");
            }
        }, this._self);
    }
    getFlags() {
        return this.flags;
    }
    getChannelFlag() {
        return this.flags.channel;
    }
    getListFlag() {
        return this.flags.list;
    }
    parseListFlag() {
        return FS.readFileSync(this.getListFlag(), "utf8").split("\n");
    }
    parseChannelFlag() {
        return this.getChannelFlag().split(",");
    }
    process() {
        let list = this.parseListFlag();
        let channels = this.parseChannelFlag();
        channels.forEach((channel) => {
            list.forEach((user) => {
                this.Twitch.chat.ban(channel, user);
            }, this._self);
        }, this._self);
    }
}
