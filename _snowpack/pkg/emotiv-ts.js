var DataStream;
(function (DataStream) {
    DataStream["RAW_EEG"] = "eeg";
    DataStream["MOTION"] = "mot";
    DataStream["DEVICE"] = "dev";
    DataStream["EEG_QUALITY"] = "eq";
    DataStream["BAND_POWER"] = "pow";
    DataStream["METRICS"] = "met";
    DataStream["MENTAL_COMMAND"] = "com";
    DataStream["FACIAL_EXPRESSION"] = "fac";
    DataStream["SYSTEM_EVENT"] = "sys";
})(DataStream || (DataStream = {}));
var DataStreamType;
(function (DataStreamType) {
    DataStreamType["EEG"] = "EEG";
    DataStreamType["MOTION"] = "MOTION";
    DataStreamType["METRICS"] = "PM";
    DataStreamType["MENTAL_COMMAND"] = "MC";
    DataStreamType["FACIAL_EXPRESSION"] = "FE";
    DataStreamType["BAND_POWER"] = "BP";
})(DataStreamType || (DataStreamType = {}));

var MentalCommand;
(function (MentalCommand) {
    MentalCommand["PUSH"] = "push";
    MentalCommand["PULL"] = "pull";
})(MentalCommand || (MentalCommand = {}));

/**
 * This enumeration holds the Emotiv profile actions.
 * These are used for performing different actions on profiles using the Cortex API, i.e. create a profile or load a profile
 */
var ProfileActions;
(function (ProfileActions) {
    ProfileActions["CREATE"] = "create";
    ProfileActions["LOAD"] = "load";
    ProfileActions["UNLOAD"] = "unload";
    ProfileActions["SAVE"] = "save";
    ProfileActions["RENAME"] = "rename";
    ProfileActions["DELETE"] = "delete";
})(ProfileActions || (ProfileActions = {}));

/**
 * This enumeration holds the Emotiv training commands.
 * These are used for performing different actions on training using the Cortex API, i.e. start a new training, cancel the current training, etc.
 */
var TrainingCommands;
(function (TrainingCommands) {
    TrainingCommands["START"] = "start";
    TrainingCommands["ACCEPT"] = "accept";
    TrainingCommands["REJECT"] = "reject";
    TrainingCommands["RESET"] = "reset";
    TrainingCommands["ERASE"] = "erase";
})(TrainingCommands || (TrainingCommands = {}));

var Emotiv;
(function (Emotiv) {
    Emotiv["JSON_RPC_VERSION"] = "2.0";
    // Session Statuses
    Emotiv["SESSION_ACTIVE"] = "active";
    Emotiv["SESSION_CLOSED"] = "close";
})(Emotiv || (Emotiv = {}));

class CortexRequest {
    jsonrpc = Emotiv.JSON_RPC_VERSION;
    id = 0;
    method = "";
    params = {};
}

/**
 * This enumeration holds the Emotiv requests IDs.
 * These ids are used to validate whether the websocket message came from the same query/request.
 */
var Requests;
(function (Requests) {
    Requests[Requests["REQUEST_ACCESS"] = 1] = "REQUEST_ACCESS";
    Requests[Requests["QUERY_HEADSET"] = 2] = "QUERY_HEADSET";
    Requests[Requests["CONTROL_DEVICE"] = 3] = "CONTROL_DEVICE";
    Requests[Requests["AUTHORIZE"] = 4] = "AUTHORIZE";
    Requests[Requests["CREATE_SESSION"] = 5] = "CREATE_SESSION";
    Requests[Requests["ACTIVATE_SESSION"] = 6] = "ACTIVATE_SESSION";
    Requests[Requests["CLOSE_SESSION"] = 7] = "CLOSE_SESSION";
    Requests[Requests["SUB_REQUEST"] = 8] = "SUB_REQUEST";
    Requests[Requests["SETUP_PROFILE"] = 9] = "SETUP_PROFILE";
    Requests[Requests["TRAINING"] = 10] = "TRAINING";
    Requests[Requests["QUERY_PROFILE"] = 11] = "QUERY_PROFILE";
    Requests[Requests["MENTAL_COMMAND_ACTIVE_ACTION"] = 12] = "MENTAL_COMMAND_ACTIVE_ACTION";
    Requests[Requests["CREATE_RECORD_REQUEST"] = 13] = "CREATE_RECORD_REQUEST";
    Requests[Requests["STOP_RECORD_REQUEST"] = 14] = "STOP_RECORD_REQUEST";
    Requests[Requests["EXPORT_RECORD_REQUEST"] = 15] = "EXPORT_RECORD_REQUEST";
    Requests[Requests["INJECT_MARKER_REQUEST"] = 16] = "INJECT_MARKER_REQUEST";
    Requests[Requests["LICENSE_INFO"] = 17] = "LICENSE_INFO";
})(Requests || (Requests = {}));

class Authorize extends CortexRequest {
    constructor(application) {
        super();
        this.id = Requests.AUTHORIZE;
        this.method = "authorize";
        this.params = {
            "clientId": application.clientId,
            "clientSecret": application.clientSecret,
            "license": application.license,
            "debit": application.debit
        };
    }
}

class LicenseInfo extends CortexRequest {
    constructor(authToken) {
        super();
        this.id = Requests.LICENSE_INFO;
        this.method = "getLicenseInfo";
        this.params = {
            "cortexToken": authToken
        };
    }
}

class RequestAccess extends CortexRequest {
    constructor(application) {
        super();
        this.id = Requests.REQUEST_ACCESS;
        this.method = "requestAccess";
        this.params = {
            "clientId": application.clientId,
            "clientSecret": application.clientSecret
        };
    }
}

class QueryProfile extends CortexRequest {
    constructor(authToken) {
        super();
        this.id = Requests.QUERY_PROFILE;
        this.method = "queryProfile";
        this.params = {
            "cortexToken": authToken
        };
    }
}

class SetupProfile extends CortexRequest {
    constructor(authToken, action, profileName, headsetId, newProfileName) {
        super();
        this.id = Requests.SETUP_PROFILE;
        this.method = "setupProfile";
        this.params = {
            "cortexToken": authToken,
            "status": action,
            "profile": profileName,
            "headset": headsetId
        };
        if (action == ProfileActions.RENAME) {
            this.params.newProfileName = newProfileName || "";
        }
    }
}

class Subscribe extends CortexRequest {
    constructor(authToken, sessionId, streams) {
        super();
        this.id = Requests.SUB_REQUEST;
        this.method = "subscribe";
        this.params = {
            "cortexToken": authToken,
            "session": sessionId,
            "streams": streams
        };
    }
}

class ControlDevice extends CortexRequest {
    constructor(headsetId) {
        super();
        this.id = Requests.CONTROL_DEVICE;
        this.method = "controlDevice";
        this.params = {
            "command": "connect",
            "headset": headsetId
        };
    }
}

class QueryHeadsets extends CortexRequest {
    constructor(headsetId) {
        super();
        this.id = Requests.QUERY_HEADSET;
        this.method = "queryHeadsets";
        if (headsetId) {
            this.params = {
                "id": headsetId
            };
        }
    }
}

class ActivateSession extends CortexRequest {
    constructor(authToken, sessionId) {
        super();
        this.id = Requests.ACTIVATE_SESSION;
        this.method = "updateSession";
        this.params = {
            "cortexToken": authToken,
            "session": sessionId,
            "status": Emotiv.SESSION_ACTIVE
        };
    }
}

class CloseSession extends CortexRequest {
    constructor(authToken, sessionId) {
        super();
        this.id = Requests.CLOSE_SESSION;
        this.method = "updateSession";
        this.params = {
            "cortexToken": authToken,
            "session": sessionId,
            "status": Emotiv.SESSION_CLOSED
        };
    }
}

class CreateSession extends CortexRequest {
    constructor(authToken, headsetId) {
        super();
        this.id = Requests.CREATE_SESSION;
        this.method = "createSession";
        this.params = {
            "cortexToken": authToken,
            "headset": headsetId,
            "status": Emotiv.SESSION_ACTIVE
        };
    }
}

class CortexResponse {
}

class Access extends CortexResponse {
    isGranted;
    message;
    constructor(isGranted, message) {
        super();
        this.isGranted = isGranted;
        this.message = message;
    }
}

class Authorisation extends CortexResponse {
    token;
    warning;
    constructor(token, warning) {
        super();
        this.token = token;
        this.warning = warning;
    }
}

class License extends CortexResponse {
    isOnline;
    license;
    constructor(isOnline, license) {
        super();
        this.isOnline = isOnline;
        this.license = license;
    }
}

class AuthenticationService {
    socket;
    static authorisation;
    constructor(socket) {
        this.socket = socket;
    }
    requestAccess(application) {
        return this.requestCortexAPI(this, new RequestAccess(application), data => new Access(data.result.accessGranted, data.result.message));
    }
    authorize(application) {
        return this.requestCortexAPI(this, new Authorize(application), data => {
            AuthenticationService.authorisation = new Authorisation(data.result.cortexToken, data.result.warning);
            return AuthenticationService.authorisation;
        });
    }
    getLicenseInfo() {
        return this.requestCortexAPI(this, new LicenseInfo(AuthenticationService.authorisation.token), data => new License(data.result.isOnline, data.result.license));
    }
    static getAuthToken() {
        return this.authorisation.token;
    }
    requestCortexAPI(context, request, onSuccess, onError) {
        return new Promise((resolve, reject) => {
            context.socket.send(JSON.stringify(request));
            context.socket.onmessage = (message) => {
                try {
                    let data = JSON.parse(message.data);
                    if (data['id'] == request.id) {
                        console.debug(`Cortex Response for the request ${request.method}:`, data);
                        resolve(onSuccess(data));
                    }
                }
                catch (error) {
                    console.error(error);
                    if (onError) {
                        onError(error);
                    }
                    reject(error);
                }
            };
        });
    }
}

class SessionService {
    socket;
    static sessionId = "";
    constructor(socket) {
        this.socket = socket;
    }
    createSession(authToken, headsetId) {
        let context = this;
        let createSessionRequest = new CreateSession(authToken, headsetId);
        return new Promise(function (resolve, reject) {
            context.socket.send(JSON.stringify(createSessionRequest));
            context.socket.onmessage = (message) => {
                try {
                    let data = JSON.parse(message.data);
                    if (data['id'] == Requests.CREATE_SESSION) {
                        console.debug("CreateSession response:", data);
                        SessionService.sessionId = data['result']['id'];
                        resolve(SessionService.sessionId);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
        });
    }
    static getSessionId() {
        return this.sessionId;
    }
    activateSession(authToken, sessionId) {
        this.updateSession(new ActivateSession(authToken, sessionId));
    }
    closeSession(authToken, sessionId) {
        this.updateSession(new CloseSession(authToken, sessionId));
    }
    updateSession(sessionRequest) {
        let context = this;
        return new Promise(function (resolve, reject) {
            context.socket.send(JSON.stringify(sessionRequest));
            context.socket.onmessage = (message) => {
                try {
                    if (JSON.parse(message.data)['id'] == sessionRequest.id) {
                        console.log(message.data);
                        resolve(message.data);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
        });
    }
}

class Unsubscribe extends CortexRequest {
    constructor(authToken, sessionId, streams) {
        super();
        this.id = Requests.SUB_REQUEST;
        this.method = "unsubscribe";
        this.params = {
            "cortexToken": authToken,
            "session": sessionId,
            "streams": streams
        };
    }
}

class DataStreamService {
    socket;
    constructor(socket) {
        this.socket = socket;
    }
    subscribe(streams, action) {
        let authToken = AuthenticationService.getAuthToken();
        let sessionId = SessionService.getSessionId();
        let subRequest = new Subscribe(authToken, sessionId, streams);
        this.socket.send(JSON.stringify(subRequest));
        this.socket.onmessage = (message) => {
            try {
                let data = JSON.parse(message.data);
                console.debug("SubRequest response:", data);
                action(data);
            }
            catch (error) {
                console.error(error);
            }
        };
    }
    unsubscribe(streams, action) {
        let authToken = AuthenticationService.getAuthToken();
        let sessionId = SessionService.getSessionId();
        let unsubRequest = new Unsubscribe(authToken, sessionId, streams);
        this.socket.send(JSON.stringify(unsubRequest));
        this.socket.onmessage = (message) => {
            try {
                let data = JSON.parse(message.data);
                console.debug("UnsubRequest response:", data);
                action(data);
            }
            catch (error) {
                console.error(error);
            }
        };
    }
}

class HeadsetService {
    socket;
    headsetId = "";
    constructor(socket) {
        this.socket = socket;
    }
    // TODO: Change the function to query all headsets instead of just the first
    // This change should be made before making it as a public library
    getHeadsets() {
        let context = this;
        let queryHeadsetRequest = new QueryHeadsets();
        return new Promise((resolve, reject) => {
            context.socket.send(JSON.stringify(queryHeadsetRequest));
            context.socket.onmessage = (message) => {
                try {
                    let data = JSON.parse(message.data);
                    if (data['id'] == Requests.QUERY_HEADSET) {
                        console.debug("QueryHeadsets response:", data);
                        if (data['result'].length > 0) {
                            context.headsetId = data['result'][0]['id'];
                            resolve(context.headsetId);
                        }
                        else {
                            console.log('No headset was found. Please, connect the headset with your pc.');
                        }
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
        });
    }
    controlDevice(headsetId) {
        let context = this;
        let controlDeviceRequest = new ControlDevice(headsetId);
        return new Promise(function (resolve, reject) {
            context.socket.send(JSON.stringify(controlDeviceRequest));
            context.socket.onmessage = (message) => {
                try {
                    if (JSON.parse(message.data)['id'] == Requests.CONTROL_DEVICE) {
                        resolve(message.data);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
        });
    }
    getHeadsetId() {
        return this.headsetId;
    }
}

var EmotivError;
(function (EmotivError) {
    EmotivError["ACCESS_NOT_GRANTED"] = "You must login on CortexUI before request for grant access then rerun";
    EmotivError["ACCESS_NOT_ACCEPTED"] = "You must accept access request from this app on CortexUI then rerun";
})(EmotivError || (EmotivError = {}));

var naiveFallback = function () {
	if (typeof self === "object" && self) return self;
	if (typeof window === "object" && window) return window;
	throw new Error("Unable to resolve global `this`");
};

var global = (function () {
	if (this) return this;

	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

	// Fallback to standard globalThis if available
	if (typeof globalThis === "object" && globalThis) return globalThis;

	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
	// In all ES5+ engines global object inherits from Object.prototype
	// (if you approached one that doesn't please report)
	try {
		Object.defineProperty(Object.prototype, "__global__", {
			get: function () { return this; },
			configurable: true
		});
	} catch (error) {
		// Unfortunate case of updates to Object.prototype being restricted
		// via preventExtensions, seal or freeze
		return naiveFallback();
	}
	try {
		// Safari case (window.__global__ works, but __global__ does not)
		if (!__global__) return naiveFallback();
		return __global__;
	} finally {
		delete Object.prototype.__global__;
	}
})();

const name = "websocket";
const description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
const keywords = [
  "websocket",
  "websockets",
  "socket",
  "networking",
  "comet",
  "push",
  "RFC-6455",
  "realtime",
  "server",
  "client"
];
const author = "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)";
const contributors = [
  "Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
];
const version = "1.0.35";
const repository = {
  type: "git",
  url: "https://github.com/theturtle32/WebSocket-Node.git"
};
const homepage = "https://github.com/theturtle32/WebSocket-Node";
const engines = {
  node: ">=4.0.0"
};
const dependencies = {
  bufferutil: "^4.0.1",
  debug: "^2.2.0",
  "es5-ext": "^0.10.63",
  "typedarray-to-buffer": "^3.1.5",
  "utf-8-validate": "^5.0.2",
  yaeti: "^0.0.6"
};
const devDependencies = {
  "buffer-equal": "^1.0.0",
  gulp: "^4.0.2",
  "gulp-jshint": "^2.0.4",
  "jshint-stylish": "^2.2.1",
  jshint: "^2.0.0",
  tape: "^4.9.1"
};
const config = {
  verbose: false
};
const scripts = {
  test: "tape test/unit/*.js",
  gulp: "gulp"
};
const main = "index";
const directories = {
  lib: "./lib"
};
const browser = "lib/browser.js";
const license = "Apache-2.0";
var require$$0 = {
  name: name,
  description: description,
  keywords: keywords,
  author: author,
  contributors: contributors,
  version: version,
  repository: repository,
  homepage: homepage,
  engines: engines,
  dependencies: dependencies,
  devDependencies: devDependencies,
  config: config,
  scripts: scripts,
  main: main,
  directories: directories,
  browser: browser,
  license: license
};

var version$1 = require$$0.version;

var _globalThis;
if (typeof globalThis === 'object') {
	_globalThis = globalThis;
} else {
	try {
		_globalThis = global;
	} catch (error) {
	} finally {
		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
		if (!_globalThis) { throw new Error('Could not determine global this'); }
	}
}

var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;



/**
 * Expose a W3C WebSocket class with just one or two arguments.
 */
function W3CWebSocket(uri, protocols) {
	var native_instance;

	if (protocols) {
		native_instance = new NativeWebSocket(uri, protocols);
	}
	else {
		native_instance = new NativeWebSocket(uri);
	}

	/**
	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
	 * class). Since it is an Object it will be returned as it is when creating an
	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
	 *
	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
	 */
	return native_instance;
}
if (NativeWebSocket) {
	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
		Object.defineProperty(W3CWebSocket, prop, {
			get: function() { return NativeWebSocket[prop]; }
		});
	});
}

/**
 * Module exports.
 */
var browser$1 = {
    'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
    'version'      : version$1
};

class ProfileService {
    socket;
    headsetService;
    constructor(socket) {
        this.socket = socket;
        this.headsetService = new HeadsetService(this.socket);
    }
    setupProfile(name, action) {
        let context = this;
        let authToken = AuthenticationService.getAuthToken();
        let headsetId = this.headsetService.getHeadsetId();
        let setupProfileRequest = new SetupProfile(authToken, action, name, headsetId);
        return new Promise(function (resolve, reject) {
            context.socket.send(JSON.stringify(setupProfileRequest));
            context.socket.onmessage = (message) => {
                if (action == ProfileActions.CREATE) {
                    resolve(message.data);
                }
                try {
                    let data = JSON.parse(message.data);
                    if (data['id'] == Requests.SETUP_PROFILE) {
                        if (data['result']['action'] == action) {
                            console.log('SETUP PROFILE -------------------------------------');
                            console.log(message.data);
                            console.log('\r\n');
                            resolve(message.data);
                        }
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
        });
    }
    getProfiles() {
        let context = this;
        let authToken = AuthenticationService.getAuthToken();
        let queryProfileRequest = new QueryProfile(authToken);
        return new Promise(function (resolve, reject) {
            context.socket.send(JSON.stringify(queryProfileRequest));
            context.socket.onmessage = (message) => {
                try {
                    if (JSON.parse(message.data)['id'] == Requests.QUERY_PROFILE) {
                        resolve(message.data);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
        });
    }
}

class EmotivService {
    application;
    socket;
    authToken;
    sessionId;
    headsetId;
    headsetService;
    authenticationService;
    sessionService;
    dataStreamService;
    constructor(socketUrl, application) {
        // Create WebSocket
        this.socket = new browser$1.w3cwebsocket(socketUrl);
        this.application = application;
        // Initialize services
        this.authenticationService = new AuthenticationService(this.socket);
        this.sessionService = new SessionService(this.socket);
        this.headsetService = new HeadsetService(this.socket);
        this.dataStreamService = new DataStreamService(this.socket);
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.socket.onopen = async () => {
                await this.authenticationService.requestAccess(this.application)
                    .then(async (emotivAccess) => {
                    console.log(emotivAccess.message);
                    if (emotivAccess.isGranted) {
                        await this.authenticationService.authorize(this.application).then(authorisation => this.authToken = authorisation.token);
                        await this.headsetService.getHeadsets().then(headsetId => this.headsetId = headsetId);
                        await this.sessionService.createSession(this.authToken, this.headsetId).then(sessionId => this.sessionId = sessionId);
                        await this.authenticationService.getLicenseInfo();
                        resolve(() => {
                            console.log("Connected successfully.");
                            let sessionInfo = this.getSessionInfo();
                            // Shows the information about the session
                            console.debug("Session Info:", sessionInfo);
                            return sessionInfo;
                        });
                    }
                    else {
                        console.error(EmotivError.ACCESS_NOT_ACCEPTED);
                        reject(EmotivError.ACCESS_NOT_ACCEPTED);
                    }
                })
                    .catch(error => {
                    // Thrown an error if user is not logged in CortexUI
                    console.error(EmotivError.ACCESS_NOT_GRANTED, error);
                    reject(error);
                });
            };
        });
    }
    readData(streams, action) {
        this.dataStreamService.subscribe(streams, action);
    }
    setupProfile(name, action) {
        let profileService = new ProfileService(this.socket);
        profileService.setupProfile(name, action).then(data => {
            console.debug("SetupProfile data:", data);
            return data;
        });
    }
    async getSessionInfo() {
        let deviceConnectionStatus;
        await this.headsetService.controlDevice(this.headsetId).then(status => deviceConnectionStatus = status);
        return {
            "authToken": this.authToken,
            "sessionId": this.sessionId,
            "headsetId": this.headsetId,
            "connectionStatus": JSON.parse(deviceConnectionStatus)['result']
        };
    }
}

export { DataStream, EmotivService };
