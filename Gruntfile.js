module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          transform: [
            ["babelify", {
              presets: ["es2015"],
              comments: true,
              minified: false,
              sourceType: "module"
            }]
          ]
        },
        files: {
          // if the source file has an extension of es6 then
          // we change the name of the source file accordingly.
          // The result file's extension is always .js
          "./dist/perfect-schema.js": ["./src/index.js"]
        }
      },
      distMin: {
        options: {
          transform: [
            ["babelify", {
              presets: ["es2015"],
              comments: false,
              minified: true,
              sourceType: "module"
            }]
          ]
        },
        files: {
          // if the source file has an extension of es6 then
          // we change the name of the source file accordingly.
          // The result file's extension is always .js
          "./dist/perfect-schema.min.js": ["./src/index.js"]
        }
      }
    },
    watch: {
      scripts: {
        files: ["./src/**/*.js"],
        tasks: ["browserify"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", ["browserify"]);
};
