+(function(document, window, undefined) {
    'use strict';
    
    var BlackHole = function BlackHole(radius, lsize) {
      this.x = (window.innerWidth / 2);
      this.y = (window.innerHeight / 2);
      this.r = radius;
      this.l = lsize;
      this.h = 0;
    }, bhp = BlackHole.prototype;
  
    bhp.center = function() {
      this.x = Math.floor(window.innerWidth / 2);
      this.y = Math.floor(window.innerHeight / 2);
    };
  
    bhp.step = function(point) {
      var dX   = (point.x - this.x), 
          dY   = (point.y - this.y),
          dist = Math.dist(this.x, this.y, point.x, point.y),
          pull = ((1 - (dist / (window.innerWidth + 100))) * 0.06);
      
      this.x += (dX * pull);
      this.y += (dY * pull);
      this.h  = ((this.h + 0.2) % 360);
    };
    
    bhp.render = function(context) {
      var gradient = context.createRadialGradient(this.x, this.y, this.r, this.x, this.y, this.r + this.l);
      //gradient.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      gradient.addColorStop(0, 'hsla(' + this.h + ', 95%, 55%, 0.75)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      context.fillStyle = gradient;
      context.beginPath();
        context.arc(this.x, this.y, this.r + this.l, 0, Math.Tau);
        context.fill();
      context.closePath();
      
      context.fillStyle = '#000000';
      context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.Tau);
        context.fill();
      context.closePath();
    };
  
    var Particle = function Particle() {
      this.x = 0;
      this.y = 0;
      
      this.reset();
    }, pp = Particle.prototype;
    
    pp.reset = function() {
      this.resetting = false;
      
      var axleX = (Math.random() >= 0.5),
          side  = (Math.random() >= 0.5);
      
      if(axleX) {
        this.y = (side ? -1 : window.innerHeight);
        this.x = Math.floor(Math.random() * window.innerWidth);
      } else {
        this.x = (side ? -1 : window.innerWidth);
        this.y = Math.floor(Math.random() * window.innerHeight);
      }
      
      this.c = 'hsla(' + Math.floor(Math.random() * 360) + ', 100%, 50%, ' + (0.5 + Math.random() * 0.5) +')';
    };
    
    pp.step = function(pullPoint) {
      if(this.resetting) {
        return;
      }
      
      var dX   = (pullPoint.x - this.x), 
          dY   = (pullPoint.y - this.y),
          dist = Math.dist(this.x, this.y, pullPoint.x, pullPoint.y),
          pull = ((1 - (dist / (window.innerWidth + 100))) * 0.06);
      
      this.c = 'hsl(' + Math.floor((dist / 1000) * 360) + ', 100%, 50%)';
      
      this.x += (dX * pull);
      this.y += (dY * pull);
      
      if(dist < pullPoint.r) {
        var that = this;
        that.resetting = true;
        setTimeout(function() {
          that.reset();
        }, 100 + Math.floor(Math.random() * 800));
      }
    };
    
    pp.render = function(context) {
      if(this.resetting) {
        return;
      }
      
      context.fillStyle = this.c.toString();
      context.beginPath();
        //context.rect(this.x - 1, this.y - 1, 2, 2);
        context.arc(this.x, this.y, 2, 0, Math.Tau);
        context.fill();
      context.closePath();
    };
    
    window.addEventListener('load', function() {
      var canvas = document.getElementById('animation'),
          context = canvas.getContext('2d'),
          hole = new BlackHole(40, 10),
          particles = [], i, limit = 50,
          mouse = false, mpos = {x: window.innerWidth / 2, y: window.innerHeight / 2}, start = +new Date(),
          stats = new Stats();
      
      stats.setMode(0);
      
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.right = '5px';
      stats.domElement.style.bottom = '5px';
  
      document.body.appendChild(stats.domElement);
      
      +(function particleGenerator() {
        particles.push(new Particle());
        
        if(particles.length < limit) {
          setTimeout(particleGenerator, 150);
        }
      }());
      
      +(function animation() {
        requestAnimFrame(animation);
        stats.begin();
        
        if(!mouse) {
          mpos = {x: window.innerWidth / 2, y: window.innerHeight / 2};
        }
        
        context.fillStyle = 'rgba(6,6,6,.85)';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        for(i = 0; i < particles.length; i += 1) {
          particles[i].step(hole);
        }
        
        for(i = 0; i < particles.length; i += 1) {
          particles[i].render(context);
        }
        
        hole.step(mpos);
        hole.render(context);
        
        stats.end();
      }());
      
      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
      
      function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      window.addEventListener('resize', resize); resize();
      canvas.addEventListener('mouseenter', function(){mouse = true;});
      canvas.addEventListener('mouseleave', function(e) {
        mouse = false;
        mpos = {
          x: Math.floor(window.innerWidth / 2),
          y: Math.floor(window.innerHeight / 2)
        }
      });
      canvas.addEventListener('mousemove', function(e) {
        mpos = getMousePos(canvas, e); 
      });
    });
    
  }(document, window));