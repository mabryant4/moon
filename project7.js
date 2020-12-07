//******************************************************************************
// CS535
// Project 7
// Marlee Bryant
//
// This program depicts a moon phase diagram utilizing a sphere with the texture
// of the moon mapped to it and a rotating light. The available dates to select
// from are November 20th 2020 through November 20th 2021, and any date in
// between can be selected from the drop downs. Keep in mind that moon phases
// vary by location and also exhibit irregular cycles which would require more
// time to model than this project allowed, so this is a simplified version.
//******************************************************************************

var canvas;
var gl;
var program;

var numTimesToSubdivide = 7;

var index = 0;

var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];

var texture1;

var r = 0.999830593296956;

var near = -10;
var far = 10;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var day1 = vec4(0.0, 0.0, -1.0, 0.0 );
var day2 = vec4(0.22252093, 0.0, -0.97492791, 0.0 );
var day3 = vec4(0.43388374, 0.0, -0.90096887, 0.0 );
var day4 = vec4(0.6234898, 0.0, -0.78183148, 0.0 );
var day5 = vec4(0.78183148, 0.0, -0.6234898, 0.0 );
var day6 = vec4(0.90096887, 0.0, -0.43388374, 0.0 );
var day7 = vec4(0.97492791, 0.0, -0.22252093, 0.0 );
var day8 = vec4(1.0, 0.0, 0.0, 0.0 );
var day9 = vec4(0.98078528, 0.0, 0.19509032, 0.0 );
var day10 = vec4(0.92387953, 0.0, 0.38268343, 0.0 );
var day11 = vec4(0.83146961, 0.0, 0.55557023, 0.0 );
var day12 = vec4(0.70710678, 0.0, 0.70710678, 0.0 );
var day13 = vec4(0.55557023, 0.0, 0.83146961, 0.0 );
var day14 = vec4(0.38268343, 0.0, 0.92387953, 0.0 );
var day15 = vec4(0.19509032, 0.0, 0.98078528, 0.0 );
var day16 = vec4(0.0, 0.0, 1.0, 0.0 );
var day17 = vec4(-0.19509032, 0.0, 0.98078528, 0.0 );
var day18 = vec4(-0.38268343, 0.0, 0.92387953, 0.0 );
var day19 = vec4(-0.55557023, 0.0, 0.83146961, 0.0 );
var day20 = vec4(-0.70710678, 0.0, 0.70710678, 0.0 );
var day21 = vec4(-0.83146961, 0.0, 0.55557023, 0.0 );
var day22 = vec4(-0.92387953, 0.0, 0.38268343, 0.0 );
var day23 = vec4(-0.98078528, 0.0, 0.19509032, 0.0 );
var day24 = vec4(-1.0, 0.0, 0.0, 0.0 );
var day25 = vec4(-0.97492791, 0.0, -0.22252093, 0.0 );
var day26 = vec4(-0.90096887, 0.0, -0.43388374, 0.0 );
var day27 = vec4(-0.78183148, 0.0, -0.6234898, 0.0 );
var day28 = vec4(-0.6234898, 0.0, -0.78183148, 0.0 );
var day29 = vec4(-0.43388374, 0.0, -0.90096887, 0.0 );
var day30 = vec4(-0.22252093, 0.0, -0.97492791, 0.0 );

var month = 12;
var year = 1;
var day = 14;
var max = 0.0;

var lightPosition;
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 0.3, 0.3, 0.3, 1.0 );

var materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialShininess = 2.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eyeLoc;

var eye = vec3(0.0,0.0,0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function configureTexture( image ) {
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    // gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    return texture;
}

var t,s;

function triangle(a, b, c) {

     // normals are vectors

     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     if(a[1]>max) {max=a[1];}
     if(b[1]>max) {max=b[1];}
     if(b[1]>max) {max=b[1];}

     t = Math.acos(a[0]/r) / (2*Math.PI);
     if (a[1] >= 0 && a[0] >= 0)
        s = Math.acos(a[1]/(r * Math.sin(Math.acos(a[0]/r)))) / (2*Math.PI);
     else
        s = (Math.PI + Math.acos(a[1]/(r * Math.sin(Math.PI + Math.acos(a[0]/r))))) / (2*Math.PI);
      texCoordsArray.push(vec2(s,t));

      t = Math.acos(b[0]/r) / (2*Math.PI);
      if (b[1] >= 0 && b[0] >= 0)
         s = Math.acos(b[1]/(r * Math.sin(Math.acos(b[0]/r)))) / (2*Math.PI);
      else
         s = (Math.PI + Math.acos(b[1]/(r * Math.sin(Math.PI + Math.acos(b[0]/r))))) / (2*Math.PI);
       texCoordsArray.push(vec2(s,t));

       t = Math.acos(c[0]/r) / (2*Math.PI);
       if (c[1] >= 0 && c[0] >= 0)
          s = Math.acos(c[1]/(r * Math.sin(Math.acos(c[0]/r)))) / (2*Math.PI);
       else
          s = (Math.PI + Math.acos(c[1]/(r * Math.sin(Math.PI + Math.acos(c[0]/r))))) / (2*Math.PI);
        texCoordsArray.push(vec2(s,t));


     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function getLightPosition() {
  if((year == 1 && day == 14) || (year == 2 && (month == 1 || month == 3) && day == 12) ||
  (year == 2 && (month == 2 || month == 4) && day == 10) || (year == 2 && month == 5 && day == 9) ||
  (year == 2 && month == 6 && day == 7) || (year == 2 && month == 7 && day == 6) || (year == 2 && month == 8 && day == 4) ||
  (year == 2 && month == 9 && day == 2) || (year == 2 && month == 10 && (day == 1 || day == 30)))
  { lightPosition = day1; }

  else if((year == 1 && day == 15) || (year == 2 && (month == 1 || month == 3) && day == 13) ||
  (year == 2 && (month == 2 || month == 4) && day == 11) || (year == 2 && month == 5 && day == 10) ||
  (year == 2 && month == 6 && day == 8) || (year == 2 && month == 7 && day == 7) || (year == 2 && month == 8 && day == 5) ||
  (year == 2 && month == 9 && day == 3) || (year == 2 && month == 10 && (day == 2 || day == 31)))
  { lightPosition = day2; }

  else if((year == 1 && day == 16) || (year == 2 && (month == 1 || month == 3) && day == 14) ||
  (year == 2 && (month == 2 || month == 4) && day == 12) || (year == 2 && month == 5 && day == 11) ||
  (year == 2 && month == 6 && day == 9) || (year == 2 && month == 7 && day == 8) || (year == 2 && month == 8 && day == 6) ||
  (year == 2 && month == 9 && day == 4) || (year == 2 && month == 10 && day == 3) || (year == 2 && month == 11 && day == 1))
  { lightPosition = day3; }

  else if((year == 1 && day == 17) || (year == 2 && (month == 1 || month == 3) && day == 15) ||
  (year == 2 && (month == 2 || month == 4) && day == 13) || (year == 2 && month == 5 && day == 12) ||
  (year == 2 && month == 6 && day == 10) || (year == 2 && month == 7 && day == 9) || (year == 2 && month == 8 && day == 7) ||
  (year == 2 && month == 9 && day == 5) || (year == 2 && month == 10 && day == 4) || (year == 2 && month == 11 && day == 2))
  { lightPosition = day4; }

  else if((year == 1 && day == 18) || (year == 2 && (month == 1 || month == 3) && day == 16) ||
  (year == 2 && (month == 2 || month == 4) && day == 14) || (year == 2 && month == 5 && day == 13) ||
  (year == 2 && month == 6 && day == 11) || (year == 2 && month == 7 && day == 10) || (year == 2 && month == 8 && day == 8) ||
  (year == 2 && month == 9 && day == 6) || (year == 2 && month == 10 && day == 5) || (year == 2 && month == 11 && day == 3))
  { lightPosition = day5; }

  else if((year == 1 && day == 19) || (year == 2 && (month == 1 || month == 3) && day == 17) ||
  (year == 2 && (month == 2 || month == 4) && day == 15) || (year == 2 && month == 5 && day == 14) ||
  (year == 2 && month == 6 && day == 12) || (year == 2 && month == 7 && day == 11) || (year == 2 && month == 8 && day == 9) ||
  (year == 2 && month == 9 && day == 7) || (year == 2 && month == 10 && day == 6) || (year == 2 && month == 11 && day == 4))
  { lightPosition = day6; }

  else if((year == 1 && day == 20) || (year == 2 && (month == 1 || month == 3) && day == 18) ||
  (year == 2 && (month == 2 || month == 4) && day == 16) || (year == 2 && month == 5 && day == 15) ||
  (year == 2 && month == 6 && day == 13) || (year == 2 && month == 7 && day == 12) || (year == 2 && month == 8 && day == 10) ||
  (year == 2 && month == 9 && day == 8) || (year == 2 && month == 10 && day == 7) || (year == 2 && month == 11 && day == 5))
  { lightPosition = day7; }

  else if((year == 1 && day == 21) || (year == 2 && (month == 1 || month == 3) && day == 19) ||
  (year == 2 && (month == 2 || month == 4) && day == 17) || (year == 2 && month == 5 && day == 16) ||
  (year == 2 && month == 6 && day == 14) || (year == 2 && month == 7 && day == 13) || (year == 2 && month == 8 && day == 11) ||
  (year == 2 && month == 9 && day == 9) || (year == 2 && month == 10 && day == 8) || (year == 2 && month == 11 && day == 6))
  { lightPosition = day8; }

  else if((year == 1 && day == 22) || (year == 2 && (month == 1 || month == 3) && day == 20) ||
  (year == 2 && (month == 2 || month == 4) && day == 18) || (year == 2 && month == 5 && day == 17) ||
  (year == 2 && month == 6 && day == 15) || (year == 2 && month == 7 && day == 14) || (year == 2 && month == 8 && day == 12) ||
  (year == 2 && month == 9 && day == 10) || (year == 2 && month == 10 && day == 9) || (year == 2 && month == 11 && day == 7))
  { lightPosition = day9; }

  else if((year == 1 && day == 23) || (year == 2 && (month == 1 || month == 3) && day == 21) ||
  (year == 2 && (month == 2 || month == 4) && day == 19) || (year == 2 && month == 5 && day == 18) ||
  (year == 2 && month == 6 && day == 16) || (year == 2 && month == 7 && day == 15) || (year == 2 && month == 8 && day == 13) ||
  (year == 2 && month == 9 && day == 11) || (year == 2 && month == 10 && day == 10) || (year == 2 && month == 11 && day == 8))
  { lightPosition = day10; }

  else if((year == 1 && day == 24) || (year == 2 && (month == 1 || month == 3) && day == 22) ||
  (year == 2 && (month == 2 || month == 4) && day == 20) || (year == 2 && month == 5 && day == 19) ||
  (year == 2 && month == 6 && day == 17) || (year == 2 && month == 7 && day == 16) || (year == 2 && month == 8 && day == 14) ||
  (year == 2 && month == 9 && day == 12) || (year == 2 && month == 10 && day == 11) || (year == 2 && month == 11 && day == 9))
  { lightPosition = day11; }

  else if((year == 1 && day == 25) || (year == 2 && (month == 1 || month == 3) && day == 23) ||
  (year == 2 && (month == 2 || month == 4) && day == 21) || (year == 2 && month == 5 && day == 20) ||
  (year == 2 && month == 6 && day == 18) || (year == 2 && month == 7 && day == 17) || (year == 2 && month == 8 && day == 15) ||
  (year == 2 && month == 9 && day == 13) || (year == 2 && month == 10 && day == 12) || (year == 2 && month == 11 && day == 10))
  { lightPosition = day12; }

  else if((year == 1 && day == 26) || (year == 2 && (month == 1 || month == 3) && day == 24) ||
  (year == 2 && (month == 2 || month == 4) && day == 22) || (year == 2 && month == 5 && day == 21) ||
  (year == 2 && month == 6 && day == 19) || (year == 2 && month == 7 && day == 18) || (year == 2 && month == 8 && day == 16) ||
  (year == 2 && month == 9 && day == 14) || (year == 2 && month == 10 && day == 13) || (year == 2 && month == 11 && day == 11))
  { lightPosition = day13; }

  else if((year == 1 && day == 27) || (year == 2 && (month == 1 || month == 3) && day == 25) ||
  (year == 2 && (month == 2 || month == 4) && day == 23) || (year == 2 && month == 5 && day == 22) ||
  (year == 2 && month == 6 && day == 20) || (year == 2 && month == 7 && day == 19) || (year == 2 && month == 8 && day == 17) ||
  (year == 2 && month == 9 && day == 15) || (year == 2 && month == 10 && day == 14) || (year == 2 && month == 11 && day == 12))
  { lightPosition = day14; }

  else if((year == 1 && day == 28) || (year == 2 && (month == 1 || month == 3) && day == 26) ||
  (year == 2 && (month == 2 || month == 4) && day == 24) || (year == 2 && month == 5 && day == 23) ||
  (year == 2 && month == 6 && day == 21) || (year == 2 && month == 7 && day == 20) || (year == 2 && month == 8 && day == 18) ||
  (year == 2 && month == 9 && day == 16) || (year == 2 && month == 10 && day == 15) || (year == 2 && month == 11 && day == 13))
  { lightPosition = day15; }

  else if((year == 1 && day == 29) || (year == 2 && (month == 1 || month == 3) && day == 27) ||
  (year == 2 && (month == 2 || month == 4) && day == 25) || (year == 2 && month == 5 && day == 24) ||
  (year == 2 && month == 6 && day == 22) || (year == 2 && month == 7 && day == 21) || (year == 2 && month == 8 && day == 19) ||
  (year == 2 && month == 9 && day == 17) || (year == 2 && month == 10 && day == 16) || (year == 2 && month == 11 && day == 14))
  { lightPosition = day16; }

  else if((year == 1 && day == 30) || (year == 2 && (month == 1 || month == 3) && day == 28) ||
  (year == 2 && (month == 2 || month == 4) && day == 26) || (year == 2 && month == 5 && day == 25) ||
  (year == 2 && month == 6 && day == 23) || (year == 2 && month == 7 && day == 22) || (year == 2 && month == 8 && day == 20) ||
  (year == 2 && month == 9 && day == 18) || (year == 2 && month == 10 && day == 17) || (year == 2 && month == 11 && day == 15))
  { lightPosition = day17; }

  else if((year == 1 && month == 12 && (day == 1 || day == 31)) || (year == 2 && (month == 1 || month == 3) && day == 29) ||
  (year == 2 && (month == 2 || month == 4) && day == 27) || (year == 2 && month == 5 && day == 26) ||
  (year == 2 && month == 6 && day == 24) || (year == 2 && month == 7 && day == 23) || (year == 2 && month == 8 && day == 21) ||
  (year == 2 && month == 9 && day == 19) || (year == 2 && month == 10 && day == 18) || (year == 2 && month == 11 && day == 16))
  { lightPosition = day18; }

  else if((year == 1 && month == 12 && day == 2) || (year == 2 && month == 1 && day == 1) ||
  (year == 2 && (month == 1 || month == 3) && day == 30) ||
  (year == 2 && (month == 2 || month == 4) && day == 28) || (year == 2 && month == 5 && day == 27) ||
  (year == 2 && month == 6 && day == 25) || (year == 2 && month == 7 && day == 24) || (year == 2 && month == 8 && day == 22) ||
  (year == 2 && month == 9 && day == 20) || (year == 2 && month == 10 && day == 19) || (year == 2 && month == 11 && day == 17))
  { lightPosition = day19; }

  else if((year == 1 && month == 12 && day == 3) || (year == 2 && month == 1 && day == 2) ||
  (year == 2 && (month == 1 || month == 3) && day == 31) ||
  (year == 2 && month == 3 && day == 1) || (year == 2 && month == 4 && day == 29) || (year == 2 && month == 5 && day == 28) ||
  (year == 2 && month == 6 && day == 26) || (year == 2 && month == 7 && day == 25) || (year == 2 && month == 8 && day == 23) ||
  (year == 2 && month == 9 && day == 21) || (year == 2 && month == 10 && day == 20) || (year == 2 && month == 11 && day == 18))
  { lightPosition = day20; }

  else if((year == 1 && month == 12 && day == 4) || (year == 2 && month == 1 && day == 3) ||
  (year == 2 && month == 2 && day == 1) || (year == 2 && month == 3 && day == 2) ||
  (year == 2 && month == 4 && (day == 1 || day == 30)) || (year == 2 && month == 5 && day == 29) ||
  (year == 2 && month == 6 && day == 27) || (year == 2 && month == 7 && day == 26) || (year == 2 && month == 8 && day == 24) ||
  (year == 2 && month == 9 && day == 22) || (year == 2 && month == 10 && day == 21) || (year == 2 && month == 11 && day == 19))
  { lightPosition = day21; }

  else if((year == 1 && month == 12 && day == 5) || (year == 2 && month == 1 && day == 4) ||
  (year == 2 && month == 2 && day == 2) || (year == 2 && month == 3 && day == 3) ||
  (year == 2 && month == 4 && day == 2) || (year == 2 && month == 5 && (day == 1 || day == 30)) ||
  (year == 2 && month == 6 && day == 28) || (year == 2 && month == 7 && day == 27) || (year == 2 && month == 8 && day == 25) ||
  (year == 2 && month == 9 && day == 23) || (year == 2 && month == 10 && day == 22) || (year == 2 && month == 11 && day == 20))
  { lightPosition = day22; }

  else if((year == 1 && month == 12 && day == 6) || (year == 2 && month == 1 && day == 5) ||
  (year == 2 && month == 2 && day == 3) || (year == 2 && month == 3 && day == 4) ||
  (year == 2 && month == 4 && day == 3) || (year == 2 && month == 5 && (day == 2 || day == 31)) ||
  (year == 2 && month == 6 && day == 29) || (year == 2 && month == 7 && day == 28) || (year == 2 && month == 8 && day == 26) ||
  (year == 2 && month == 9 && day == 24) || (year == 2 && month == 10 && day == 23))
  { lightPosition = day23; }

  else if((year == 1 && month == 12 && day == 7) || (year == 2 && month == 1 && day == 6) ||
  (year == 2 && month == 2 && day == 4) || (year == 2 && month == 3 && day == 5) ||
  (year == 2 && month == 4 && day == 4) || (year == 2 && month == 5 && day == 3) ||
  (year == 2 && month == 6 && (day == 1 || day == 30)) || (year == 2 && month == 7 && day == 29) ||
  (year == 2 && month == 8 && day == 27) || (year == 2 && month == 9 && day == 25) || (year == 2 && month == 10 && day == 24))
  { lightPosition = day24; }

  else if((year == 1 && month == 12 && day == 8) || (year == 2 && month == 1 && day == 7) ||
  (year == 2 && month == 2 && day == 5) || (year == 2 && month == 3 && day == 6) ||
  (year == 2 && month == 4 && day == 5) || (year == 2 && month == 5 && day == 4) ||
  (year == 2 && month == 6 && day == 2) || (year == 2 && month == 7 && (day == 1 || day == 30)) ||
  (year == 2 && month == 8 && day == 28) || (year == 2 && month == 9 && day == 26) || (year == 2 && month == 10 && day == 25))
  { lightPosition = day25; }

  else if((year == 1 && month == 12 && day == 9) || (year == 2 && month == 1 && day == 8) ||
  (year == 2 && month == 2 && day == 6) || (year == 2 && month == 3 && day == 7) ||
  (year == 2 && month == 4 && day == 6) || (year == 2 && month == 5 && day == 5) ||
  (year == 2 && month == 6 && day == 3) || (year == 2 && month == 7 && (day == 2 || day == 31)) ||
  (year == 2 && month == 8 && day == 29) || (year == 2 && month == 9 && day == 27) || (year == 2 && month == 10 && day == 26))
  { lightPosition = day26; }

  else if((year == 1 && month == 12 && day == 10) || (year == 2 && month == 1 && day == 9) ||
  (year == 2 && month == 2 && day == 7) || (year == 2 && month == 3 && day == 8) ||
  (year == 2 && month == 4 && day == 7) || (year == 2 && month == 5 && day == 6) ||
  (year == 2 && month == 6 && day == 4) || (year == 2 && month == 7 && day == 3) ||
  (year == 2 && month == 8 && (day == 1 || day == 30)) || (year == 2 && month == 9 && day == 28) ||
  (year == 2 && month == 10 && day == 27))
  { lightPosition = day27; }

  else if((year == 1 && month == 12 && day == 11) || (year == 2 && month == 1 && day == 10) ||
  (year == 2 && month == 2 && day == 8) || (year == 2 && month == 3 && day == 9) ||
  (year == 2 && month == 4 && day == 8) || (year == 2 && month == 5 && day == 7) ||
  (year == 2 && month == 6 && day == 5) || (year == 2 && month == 7 && day == 4) ||
  (year == 2 && month == 8 && (day == 2 || day == 31)) || (year == 2 && month == 9 && day == 29) ||
  (year == 2 && month == 10 && day == 28))
  { lightPosition = day28; }

  else if((year == 1 && month == 12 && day == 12) || (year == 2 && month == 1 && day == 11) ||
  (year == 2 && month == 2 && day == 9) || (year == 2 && month == 3 && day == 10) ||
  (year == 2 && month == 4 && day == 9) || (year == 2 && month == 5 && day == 8) ||
  (year == 2 && month == 6 && day == 6) || (year == 2 && month == 7 && day == 5) ||
  (year == 2 && month == 8 && day == 3) || (year == 2 && month == 9 && (day == 1 || day == 30)) ||
  (year == 2 && month == 10 && day == 29))
  { lightPosition = day29; }

  else { lightPosition = day30; }
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var img1 = document.getElementById("Moon");
    texture1=configureTexture(img1);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("monthS1").style.display = "none";
    document.getElementById("monthS2").style.display = "none";

    document.getElementById("dayS1").style.display = "none";
    document.getElementById("dayS2").style.display = "none";
    document.getElementById("dayS3").style.display = "none";
    document.getElementById("dayS4").style.display = "none";
    document.getElementById("dayS5").style.display = "none";

    document.getElementById("yearS").onchange =
    function() {
      if(this.value=="y1") {
          year = 1;
          document.getElementById("monthS1").style.display = "initial";
          document.getElementById("monthS2").style.display = "none";
          document.getElementById("dayS1").style.display = "none";
          document.getElementById("dayS2").style.display = "none";
          document.getElementById("dayS3").style.display = "none";
          document.getElementById("dayS4").style.display = "none";
          document.getElementById("dayS5").style.display = "none";
      }
      else {
          year = 2;
          document.getElementById("monthS2").style.display = "initial";
          document.getElementById("monthS1").style.display = "none";
          document.getElementById("dayS1").style.display = "none";
          document.getElementById("dayS2").style.display = "none";
          document.getElementById("dayS3").style.display = "none";
          document.getElementById("dayS4").style.display = "none";
          document.getElementById("dayS5").style.display = "none";
      }
      render();
    }

    document.getElementById("monthS1").onchange =
    function() {
      if(this.value == "m11") {
        month = 11;
        document.getElementById("dayS1").style.display = "initial";
        document.getElementById("dayS2").style.display = "none";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else {
        month = 12;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      render();
    }

    document.getElementById("monthS2").onchange =
    function() {
      if(this.value=="m1") {
        month =1;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m2") {
        month=2;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "none";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "initial";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m3") {
        month=3;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m4") {
        month=4;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "none";
        document.getElementById("dayS3").style.display = "initial";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m5") {
        month=5;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m6") {
        month=6;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "none";
        document.getElementById("dayS3").style.display = "initial";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m7") {
        month=7;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m8") {
        month=8;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m9") {
        month=9;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "none";
        document.getElementById("dayS3").style.display = "initial";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else if(this.value == "m10") {
        month=10;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "initial";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "none";
      }
      else {
        month=11;
        document.getElementById("dayS1").style.display = "none";
        document.getElementById("dayS2").style.display = "none";
        document.getElementById("dayS3").style.display = "none";
        document.getElementById("dayS4").style.display = "none";
        document.getElementById("dayS5").style.display = "initial";
      }
      render();
    }

    document.getElementById("dayS1").onchange =
    function() {
      day=parseInt(this.value);
      render();
    }

    document.getElementById("dayS2").onchange =
    function() {
      day=parseInt(this.value);
      render();
    }

    document.getElementById("dayS3").onchange =
    function() {
      day=parseInt(this.value);
      render();
    }

    document.getElementById("dayS4").onchange =
    function() {
      day=parseInt(this.value);
      render();
    }

    document.getElementById("dayS5").onchange =
    function() {
      day=parseInt(this.value);
      render();
    }

    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
    gl.uniform3fv(gl.getUniformLocation(program,
        "eyePosition"), flatten(eye));



    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    getLightPosition();

    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.bindTexture(gl.TEXTURE_2D, texture1);
    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
