class Game extends Engine {
  constructor(canvas) {
    super(canvas);
    this.loaded = false;
    this.camAngle = 0;
    this.spriteSheet = document.createElement("img");
    this.spriteSheet.src = "img/spriteSheet.png";
    this.spriteSheet.addEventListener("load", () => {
      this.players = [new Player(this.spriteSheet), new Player(this.spriteSheet)];
      this.players[0].x, this.players[0].y = -250;
      this.players[1].x, this.players[1].y = -500;
      this.zombies = [];
      for (var i = 0; i < 1; i++) {
        const zombie = new Zombie(this.spriteSheet);
        // zombie.pos.x = Math.random() * 6000 + 500;
        // zombie.pos.y = Math.random() * 6000 + 500;
        this.zombies.push(zombie);
      }
      this.floor = new Floor(this.spriteSheet);
      this.loaded = true;
    });
  }

  draw() {
    if (!this.loaded) {
      return;
    }
    // clear the screen
    this._context.fillStyle = "#eee";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this._context.save();

    // moves everything relative to the player
    this._context.translate(this._canvas.width/2,  this._canvas.height/2);
    this._context.rotate(this.camAngle / 180 * Math.PI); // rotate everything except the player

    this.drawFloor(this.floor, 50, 50);

    this.zombies.forEach(zombie => {
      this.drawAttachment(zombie, zombie.attachments[0]); // draw each zombies arms
      this.drawSprite(zombie); // draw each zombie
    });

    this.players.forEach((player, index) => {
      if (index != 0) {
        this.drawAttachment(player, player.attachments[0]);
        this.drawSprite(player); // draw each player except the first one
      }
    });

    this._context.restore();

    this._context.save();
    this._context.translate(this._canvas.width/2,  this._canvas.height/2);
    this.drawAttachment(this.players[0], this.players[0].attachments[0]);
    this.drawPlayer(this.players[0]);
    this._context.rotate(this.camAngle / 180 * Math.PI); // rotate everything except the player
    this._context.restore();

  }

  drawPlayer(player) {
    this._context.save();

    // collider of the player
    // this._context.fillStyle = "#000";
    // this._context.fillRect(0 - player.size.x/2, 0 - player.size.y/2, player.size.x, player.size.y);

    this._context.rotate((this.camAngle - player.rotation) / 180 * Math.PI);
    this._context.drawImage(player.img, player.spritePos.x, player.spritePos.y, player.spriteSize.x, player.spriteSize.y, 0 - player.size.x/2 + player.middle.x, 0 - player.size.y/2 + player.middle.y, player.size.x, player.size.y); // draws from the center
    this._context.restore();
  }

  drawSprite(sprite) {
    this._context.save();
    this._context.translate(sprite.pos.x - this.players[0].pos.x, sprite.pos.y - this.players[0].pos.y);
    // collider of the sprite
    // this._context.fillStyle = "#000";
    // this._context.fillRect(0 - sprite.size.x/2, 0 - sprite.size.y/2, sprite.size.x, sprite.size.y);

    this._context.rotate(sprite.rotation / 180 * Math.PI);
    // guide line to see where the sprite is "looking"
    // this._context.beginPath();
    // this._context.moveTo(0,0);
    // this._context.lineTo(0,-300);
    // this._context.stroke();
    // this._context.closePath();
    this._context.drawImage(sprite.img, sprite.spritePos.x, sprite.spritePos.y, sprite.spriteSize.x, sprite.spriteSize.y, 0 - sprite.size.x/2 + sprite.middle.x, 0 - sprite.size.y/2 + sprite.middle.y, sprite.size.x, sprite.size.y); // draws from the center
    this._context.restore();
  }

  drawFloor(floor, sizeX, sizeY) {
    this._context.save();
    this._context.translate(floor.pos.x - this.players[0].pos.x, floor.pos.y - this.players[0].pos.y);
    this._context.rotate(floor.rotation / 180 * Math.PI);
    for (var x = 0; x < sizeX; x++) {
      for (var y = 0; y < sizeY; y++) {
        this._context.drawImage(floor.img, floor.spritePos.x, floor.spritePos.y, floor.spriteSize.x, floor.spriteSize.y, 0 - floor.size.x/2 + floor.size.x*x + floor.middle.x, 0 - floor.size.x/2 + floor.size.y*y + floor.middle.y, floor.size.x, floor.size.y); // draws from the center
      }
    }
    this._context.restore();
  }

  drawAttachment(entity, attachment) {
    this._context.save();
    this._context.translate(entity.pos.x - this.players[0].pos.x, entity.pos.y - this.players[0].pos.y);
    if (entity === this.players[0]) {
      this._context.rotate(attachment.rotation / 180 * Math.PI);
    } else {
      this._context.rotate((entity.rotation + attachment.rotation) / 180 * Math.PI);
    }
    this._context.drawImage(attachment.img, attachment.spritePos.x, attachment.spritePos.y, attachment.spriteSize.x, attachment.spriteSize.y, 0 - attachment.size.x/2 + attachment.middle.x, 0 - attachment.size.y/2 + attachment.middle.y, attachment.size.x, attachment.size.y); // draws from the center
    this._context.restore();
  }

  simulate(dt) {
    if (!this.loaded) {
      return;
    }
    this.camAngle += (this.players[0].rotation - this.camAngle) * 15 * dt; // adds an smooth rotation

    this.zombies.forEach(zombie => {
      // get the distances
      const len = this.players.map((player) => {
        return zombie.pos.distance(player.pos);
      }).map((dist) => {
        return dist.len;
      });

      // get the closest player from the array
      let closest = 0;
      for (var i = 0; i < len.length; i++) {
        if (len[i] < len[closest]) {
          closest = i;
        }
      }
      // rotate to the closest person
      zombie.lookAt(this.players[closest], 1 * dt);
      // move towards the player
      zombie.forwards(100 * dt);
    });

    // do stuff with the input
    if (this.inputHandler.down.indexOf("down") != -1) {
      this.players[0].backwards(150 * dt);
    }
    if (this.inputHandler.down.indexOf("up") != -1) {
      this.players[0].forwards(150 * dt);
    }
    if (this.inputHandler.down.indexOf("left") != -1) {
      this.players[0].rotation += 180 * dt;
    }
    if (this.inputHandler.down.indexOf("right") != -1) {
      this.players[0].rotation -= 180 * dt;
    }
  }

}

const canvas = document.getElementById("canvas");
canvas.width = document.body.clientWidth; // sets the canvas width to full body width
canvas.height = document.body.clientHeight; // sets the canvas height to full body width
const game = new Game(canvas);
