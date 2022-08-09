export class InputController {
  constructor(id) {
    this.div = document.getElementById(id);
    this.minOffsetX = 20;
    this.minOffsetY = 20;
    this.events = new EventTarget();
    this.duration = 2000; // ms
    this.historySize = 3;
    this.animationCurve = new AnimationCurve([
      0, 0.17, 0.24, 0.28, 0.32, 0.36, 0.39, 0.41, 0.44, 0.46, 0.48, 0.5, 0.52,
      0.54, 0.55, 0.57, 0.58, 0.6, 0.61, 0.63, 0.64, 0.65, 0.66, 0.68, 0.69,
      0.7, 0.71, 0.72, 0.73, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.78, 0.79,
      0.8, 0.81, 0.81, 0.82, 0.83, 0.83, 0.84, 0.85, 0.85, 0.86, 0.86, 0.87,
      0.87, 0.88, 0.88, 0.89, 0.89, 0.9, 0.9, 0.91, 0.91, 0.91, 0.92, 0.92,
      0.92, 0.93, 0.93, 0.94, 0.94, 0.94, 0.95, 0.95, 0.95, 0.95, 0.96, 0.96,
      0.96, 0.96, 0.97, 0.97, 0.97, 0.97, 0.98, 0.98, 0.98, 0.98, 0.98, 0.99,
      0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 1, 1, 1, 1, 1, 1, 1, 1,
    ]);
    this.animationId;
    this.listen();
  }

  listen() {
    this.div.addEventListener("mousedown", this.start.bind(this));
  }

  start(e) {
    let hasMoved = false;
    let hasStopped = false;
    let starttime;
    let currentMouseX = e.pageX;
    let lastMouseX = e.pageX;
    let currentMouseY = e.pageY;
    let lastMouseY = e.pageY;
    let speedsX = new FixedQueue(this.historySize);
    let speedX = 0;
    let currentSpeedX;
    let speedsY = new FixedQueue(this.historySize);
    let speedY = 0;
    let currentSpeedY;

    const stop = () => {
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("mousemove", onMouseMove);
      hasStopped = true;
    };

    const onMouseMove = (e) => {
      currentMouseX = e.pageX;
      currentMouseY = e.pageY;
      speedsX.push(e.movementX);
      speedsY.push(e.movementY);
      hasMoved = true;
    };

    const update = () => {
      if (hasStopped) {
        starttime = undefined;
        speedX = speedsX.arr.reduce((acc, value) => Math.abs(value) > Math.abs(acc) ? value : acc, 0);
        speedY = speedsY.arr.reduce((acc, value) => Math.abs(value) > Math.abs(acc) ? value : acc, 0);
        currentSpeedX = speedX;
        currentSpeedY = speedY;
        if (Math.abs(speedX) > 0 || Math.abs(speedY) > 0)
          this.animationId = requestAnimationFrame(animate.bind(this));
        return;
      }

      if (hasMoved) {
        handleMovement();
        hasMoved = false;
      }

      window.requestAnimationFrame(update.bind(this));
    };

    const handleMovement = () => {
      const offsetX = Math.abs(currentMouseX - lastMouseX);
      if (offsetX >= this.minOffsetX) {
        const isRightDrag = currentMouseX > lastMouseX;
        this.events.dispatchEvent(new Event(isRightDrag ? "right" : "left"));
        lastMouseX = currentMouseX;
      }

      const offsetY = Math.abs(lastMouseY - currentMouseY);
      if (offsetY >= this.minOffsetY) {
        const isUpDrag = currentMouseY < lastMouseY;
        this.events.dispatchEvent(new Event(isUpDrag ? "up" : "down"));
        lastMouseY = currentMouseY;
      }
    };

    const animate = (timestamp) => {
      if (!starttime) {
        starttime = timestamp;
      }

      const runtime = timestamp - starttime;

      if (runtime > this.duration) return;

      const animationFactor = this.animationCurve.evaluate(
        runtime / this.duration
      );
      const newSpeedX = speedX * animationFactor;
      if (Math.floor(currentSpeedX) != Math.floor(newSpeedX)) {
        this.events.dispatchEvent(new Event(speedX > 0 ? "right" : "left"));
      }
      currentSpeedX = newSpeedX;

      const newSpeedY = speedY * animationFactor;
      if (Math.floor(currentSpeedY) != Math.floor(newSpeedY)) {
        this.events.dispatchEvent(new Event(speedY > 0 ? "down" : "up"));
      }
      currentSpeedY = newSpeedY;

      this.animationId = window.requestAnimationFrame(animate.bind(this));
    };

    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
    }

    document.addEventListener("mouseup", stop);
    document.addEventListener("mousemove", onMouseMove);

    window.requestAnimationFrame(update.bind(this));
  }
}

class FixedQueue {
  constructor(size) {
    this.arr = [];
    this.size = size;
    this.length = 0;
  }

  push(elem) {
    if (this.length == this.size) {
      this.arr.pop();
      this.arr.unshift(elem);
    } else {
      this.arr.unshift(elem);
      this.length++;
    }
  }
}

class AnimationCurve {
  constructor(points) {
    this.points = points;
  }

  evaluate(t) {
    if (t > 1) return this.points.at(-1);
    const index = Math.round((this.points.length - 1) * t);
    return this.points[index];
  }
}
