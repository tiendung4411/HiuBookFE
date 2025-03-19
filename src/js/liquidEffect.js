class Point {
  constructor(x, y, level) {
    this.x = this.ix = 50 + x;
    this.y = this.iy = 50 + y;
    this.vx = 0;
    this.vy = 0;
    this.cx1 = 0;
    this.cy1 = 0;
    this.cx2 = 0;
    this.cy2 = 0;
    this.level = level;
  }

  move(
    relMouseX,
    relMouseY,
    mouseDirectionX,
    mouseDirectionY,
    mouseSpeedX,
    mouseSpeedY,
    viscosity,
    damping,
    mouseDist
  ) {
    this.vx += (this.ix - this.x) / (viscosity * this.level);
    this.vy += (this.iy - this.y) / (viscosity * this.level);

    const dx = this.ix - relMouseX;
    const dy = this.iy - relMouseY;
    const relDist = 1 - Math.sqrt(dx * dx + dy * dy) / mouseDist;

    if (
      (mouseDirectionX > 0 && relMouseX > this.x) ||
      (mouseDirectionX < 0 && relMouseX < this.x)
    ) {
      if (relDist > 0 && relDist < 1) {
        this.vx = (mouseSpeedX / 4) * relDist;
      }
    }
    this.vx *= 1 - damping;
    this.x += this.vx;

    if (
      (mouseDirectionY > 0 && relMouseY > this.y) ||
      (mouseDirectionY < 0 && relMouseY < this.y)
    ) {
      if (relDist > 0 && relDist < 1) {
        this.vy = (mouseSpeedY / 4) * relDist;
      }
    }
    this.vy *= 1 - damping;
    this.y += this.vy;
  }
}

export const initLiquidEffect = (canvasRef, buttonRef) => {
  const pointsA = [];
  const pointsB = [];
  let points = 8;
  const viscosity = 20;
  const mouseDist = 70;
  const damping = 0.05;
  let mouseX = 0;
  let mouseY = 0;
  let relMouseX = 0;
  let relMouseY = 0;
  let mouseLastX = 0;
  let mouseLastY = 0;
  let mouseDirectionX = 0;
  let mouseDirectionY = 0;
  let mouseSpeedX = 0;
  let mouseSpeedY = 0;

  const mouseDirection = (e) => {
    if (mouseX < e.pageX) mouseDirectionX = 1;
    else if (mouseX > e.pageX) mouseDirectionX = -1;
    else mouseDirectionX = 0;

    if (mouseY < e.pageY) mouseDirectionY = 1;
    else if (mouseY > e.pageY) mouseDirectionY = -1;
    else mouseDirectionY = 0;

    mouseX = e.pageX;
    mouseY = e.pageY;

    const rect = buttonRef.current.getBoundingClientRect();
    relMouseX = mouseX - rect.left;
    relMouseY = mouseY - rect.top;
  };

  const mouseSpeed = () => {
    mouseSpeedX = mouseX - mouseLastX;
    mouseSpeedY = mouseY - mouseLastY;

    mouseLastX = mouseX;
    mouseLastY = mouseY;

    setTimeout(mouseSpeed, 50);
  };

  const initButton = () => {
    const button = buttonRef.current;
    const buttonWidth = button.offsetWidth;
    const buttonHeight = button.offsetHeight;

    const canvas = canvasRef.current;
    canvas.width = buttonWidth + 100;
    canvas.height = buttonHeight + 100;
    const context = canvas.getContext("2d");

    const x = buttonHeight / 2;
    for (let j = 1; j < points; j++) {
      addPoints(x + ((buttonWidth - buttonHeight) / points) * j, 0);
    }
    addPoints(buttonWidth - buttonHeight / 5, 0);
    addPoints(buttonWidth + buttonHeight / 10, buttonHeight / 2);
    addPoints(buttonWidth - buttonHeight / 5, buttonHeight);
    for (let j = points - 1; j > 0; j--) {
      addPoints(x + ((buttonWidth - buttonHeight) / points) * j, buttonHeight);
    }
    addPoints(buttonHeight / 5, buttonHeight);
    addPoints(-buttonHeight / 10, buttonHeight / 2);
    addPoints(buttonHeight / 5, 0);

    renderCanvas(context, canvas);
  };

  const addPoints = (x, y) => {
    pointsA.push(new Point(x, y, 1));
    pointsB.push(new Point(x, y, 2));
  };

  const renderCanvas = (context, canvas) => {
    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < pointsA.length; i++) {
        pointsA[i].move(
          relMouseX,
          relMouseY,
          mouseDirectionX,
          mouseDirectionY,
          mouseSpeedX,
          mouseSpeedY,
          viscosity,
          damping,
          mouseDist
        );
        pointsB[i].move(
          relMouseX,
          relMouseY,
          mouseDirectionX,
          mouseDirectionY,
          mouseSpeedX,
          mouseSpeedY,
          viscosity,
          damping,
          mouseDist
        );
      }

      const gradientX = Math.min(
        Math.max(mouseX - buttonRef.current.getBoundingClientRect().left, 0),
        canvas.width
      );
      const gradientY = Math.min(
        Math.max(mouseY - buttonRef.current.getBoundingClientRect().top, 0),
        canvas.height
      );
      const distance =
        Math.sqrt(
          Math.pow(gradientX - canvas.width / 2, 2) +
            Math.pow(gradientY - canvas.height / 2, 2)
        ) /
        Math.sqrt(
          Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
        );

      const gradient = context.createRadialGradient(
        gradientX,
        gradientY,
        300 + 300 * distance,
        gradientX,
        gradientY,
        0
      );
      gradient.addColorStop(0, "var(--primary-dark)");
      gradient.addColorStop(1, "var(--secondary-color)");

      const groups = [pointsA, pointsB];
      for (let j = 0; j <= 1; j++) {
        const points = groups[j];

        if (j === 0) {
          context.fillStyle = "var(--primary-light)";
        } else {
          context.fillStyle = gradient;
        }

        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const nextP = points[i + 1] || points[0];
          p.cx1 = (p.x + nextP.x) / 2;
          p.cy1 = (p.y + nextP.y) / 2;

          context.bezierCurveTo(p.x, p.y, p.cx1, p.cy1, p.cx1, p.cy1);
        }

        context.fill();
      }

      requestAnimationFrame(render);
    };

    render();
  };

  return {
    start: () => {
      initButton();
      document.addEventListener("mousemove", mouseDirection);
      mouseSpeed();
    },
    cleanup: () => {
      document.removeEventListener("mousemove", mouseDirection);
    }
  };
};
