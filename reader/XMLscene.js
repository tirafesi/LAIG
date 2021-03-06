function XMLscene(MyInterface) {
    CGFscene.call(this);
    this.interface = MyInterface;
    this.allowMoveCamera = true;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Updates the scene based on time
 * @param currTime The current time in milliseconds
 */
XMLscene.prototype.update = function(currTime) {
    if (this.graph.loadedOk) {
        this.graph.update(currTime);
        this.game.update(currTime);
    }
};

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.enableTextures(true);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);


    this.axis = new CGFaxis(this);


    this.lightCount = 0;
    this.lightsStatus = [];

    this.setUpdatePeriod(17);

    this.setPickEnabled(true);


    this.game = new Game(this,30);
    //game options selector 
    this.menu = new Menu(this,62);


};

XMLscene.prototype.initLights = function() {

    this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].update();
};

XMLscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {

    this.gl.clearColor(this.graph.illumination.background[0], this.graph.illumination.background[1], this.graph.illumination.background[2], this.graph.illumination.background[3]);


    this.setDefaultAxis();
    this.setDefaultCamera();
    this.setDefaultIllumination();







};

XMLscene.prototype.display = function() {
    this.clearPickRegistration();
    this.logPicking();



    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    this.axis.display();

    this.setDefaultAppearance();

    // ---- END Background, camera and axis setup

    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it



    if (this.graph.loadedOk) {
        for (var i = 0; i < this.lightCount; i++) {
            if (this.lightsStatus[i])
                this.lights[i].enable();
            else {
                this.lights[i].disable();
            }
            this.lights[i].update();
        }
        this.graph.display(this);


        this.game.display();
        
        this.menu.display();


    }




};

/**
 * Change camera to a new perspective
 * @param perspective camera caracteristic
 */
XMLscene.prototype.setCamera = function(perspective) {
    if (this.allowMoveCamera === false) {
        this.camera = new CGFcamera(perspective.angle, perspective.near, perspective.far,
            vec3.fromValues(perspective.from[0], perspective.from[1], perspective.from[2]),
            vec3.fromValues(perspective.to[0], perspective.to[1], perspective.to[2]));
    } else {
        this.interface.setActiveCamera(this.camera);
    }
};

XMLscene.prototype.setDefaultAxis = function() {
    this.axis = new CGFaxis(this, this.graph.xmlSceneTag.axis_length);
};

XMLscene.prototype.setNextCamera = function() {
    this.setCamera(this.graph.views.getNextPerspective());
};

XMLscene.prototype.playPerspectiveAnimation = function() {
    this.graph.activatePerspAnim();
};

XMLscene.prototype.nextMaterial = function() {
    this.graph.nextMaterial(this);
};

XMLscene.prototype.setDefaultCamera = function() {

    var perspective = this.graph.views.getDefaultCamera();
    this.camera = new CGFcamera(perspective.angle, perspective.near, perspective.far,
        vec3.fromValues(perspective.from[0], perspective.from[1], perspective.from[2]),
        vec3.fromValues(perspective.to[0], perspective.to[1], perspective.to[2]));
    this.interface.setActiveCamera(this.camera);
};
/**
Set ligth configuration readed from xml file;
*/
XMLscene.prototype.setDefaultIllumination = function() {
       
    

    this.lightCount = 0;
    
    this.setGlobalAmbientLight(this.graph.illumination.ambient[0], this.graph.illumination.ambient[1], this.graph.illumination.ambient[2], this.graph.illumination.ambient[3]);

    var light;

    /* OMNIS CONFIG*/
    var nOmnis = this.graph.lights.omni.length;
    for (var i = 0; i < nOmnis; i++, this.lightCount++) {
        light = this.graph.lights.omni[i];


        this.lights[this.lightCount].setPosition(light.location[0], light.location[1], light.location[2], light.location[3]);
        this.lights[this.lightCount].setAmbient(light.ambient[0], light.ambient[1], light.ambient[2], light.ambient[3]);
        this.lights[this.lightCount].setDiffuse(light.diffuse[0], light.diffuse[1], light.diffuse[2], light.diffuse[3]);
        this.lights[this.lightCount].setSpecular(light.specular[0], light.specular[1], light.specular[2], light.specular[3]);
        this.lights[this.lightCount].setSpotCutOff(360); // TODO QUAL é o default?? nao tem doc


        if (light.enabled) {
            this.lights[this.lightCount].enable();
            this.lightsStatus.push(true);
        } else {
            this.lights[this.lightCount].disable();
            this.lightsStatus.push(false);
        }
        this.lights[this.lightCount].setVisible(true);
        this.interface.addLights(this.graph.lights.omni[i].id, this.lightCount);
    }


    // SPOTS CONFIG
    var nSpots = this.graph.lights.spot.length;

    for (var i = 0; i < nSpots; i++, this.lightCount++) {
        light = this.graph.lights.spot[i];


        this.lights[this.lightCount].setPosition(light.location[0], light.location[1], light.location[2], light.location[3]);
        this.lights[this.lightCount].setSpotDirection(light.target[0] - light.location[0], light.target[1] - light.location[1], light.target[2] - light.location[2]);
        this.lights[this.lightCount].setSpotExponent(light.exponent);
        this.lights[this.lightCount].setSpotCutOff(light.angle); //TODO NOT SURE

        this.lights[this.lightCount].setAmbient(light.ambient[0], light.ambient[1], light.ambient[2], light.ambient[3]);
        this.lights[this.lightCount].setDiffuse(light.diffuse[0], light.diffuse[1], light.diffuse[2], light.diffuse[3]);
        this.lights[this.lightCount].setSpecular(light.specular[0], light.specular[1], light.specular[2], light.specular[3]);

        if (light.enabled) {
            this.lights[this.lightCount].enable();
            this.lightsStatus.push(true);
        } else {
            this.lights[this.lightCount].disable();
            this.lightsStatus.push(false);

        }

        this.lights[this.lightCount].setVisible(true);
        this.interface.addLights(this.graph.lights.spot[i].id, this.lightCount);
    }
};


XMLscene.prototype.logPicking = function() {
    if (this.pickMode == false) {
        if (this.pickResults != null && this.pickResults.length > 0) {
            for (var i = 0; i < this.pickResults.length; i++) {
                var obj = this.pickResults[i][0];
                if (obj) {
                    var customId = this.pickResults[i][1];
                    if(customId < 62){
                    this.game.updateBoardPick(customId);
                    console.log(this.game.playBoard.getPosition(customId));
                    console.log(customId);
                    }
                    else{
                        console.log(customId);
                        this.menu.updateOptions(customId);
                    }
                }
            }
            this.pickResults.splice(0, this.pickResults.length);
        }
    }
}
