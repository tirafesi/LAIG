function DisplayerChar(scene, value) {
    CGFobject.call(this, scene);

    this.scene = scene;

    this.lastCurrTime = -1;

    this.value = value;

    // scene obj
    this.width = 0.2;
    this.height = 0.2;

    this.show2 = new Rectangle(scene, [this.width/2, this.height/2], [-this.width/2, -this.height/2]);
    this.font = new Font(scene);
};



DisplayerChar.prototype = Object.create(CGFobject.prototype);
DisplayerChar.prototype.constructor = DisplayerChar;


DisplayerChar.prototype.display = function() {

    this.font.material.apply();
    this.scene.setActiveShader(this.font.shader);



    this.scene.pushMatrix();
    this.scene.rotate(3.14,0,0,1);


    var charPosN2 = this.font.charPosition(this.value);
    this.scene.activeShader.setUniformsValues({
        charPosition: charPosN2
    });
    this.scene.translate(-this.width, 0, 0);
    this.show2.display();



    this.scene.popMatrix();

    this.scene.setActiveShader(this.scene.defaultShader);
}
