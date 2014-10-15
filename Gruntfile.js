module.exports = function(grunt) {
    'use strict';
    var remapify = require('remapify');

    //project Config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['katas/**/*.js', 'test/unit/**/*.js'],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        }, //jshint

        browserify: {
            options: {
                debug: true,
            },
            test: {
                files: {
                    'test/browserified.js': ['test/unit/**/*.js'],
                }
            }
        }, //browserify

        jsbeautifier: {
            files: ["katas/**/*.js", "test/unit/**/*.js", "Gruntfile.js"],
            options: {
                jshintrc: '.jsbeautify'
            },
        },

        copy: {
            spec: {
                expand: true,
                cwd: 'katas/',
                nonull: true,
                src: ['**/**.js', '!bundle.js'],
                dest: 'test/unit/',
                filter: function(filepath) {
                    var path = require('path');
                    var dest = path.join(
                        grunt.config('copy.spec.dest'),
                        filepath.split(path.sep).slice(2).join(path.sep)
                    );
                    return !(grunt.file.exists(dest));
                },
                rename: function(dest, src) {
                    var src_spec = src.split('.')[0] + "_spec.js"
                    return dest + src_spec;
                },
                options: {
                    process: function(content, srcpath) {
                        var varName = srcpath.split('/')[2].split('.')[0],
                            require = "var " + varName + " = " + "require('" + '../../' + srcpath + "');";
                        return content = content.replace(/(.|\n)/g, require);
                    }
                }
            }
        }, //copy

        plato: {
            lint: {
                options: {
                    jshint: grunt.file.readJSON('.jshintrc'),
                    dir: "reports",
                    title: grunt.file.readJSON('package.json').name,
                    complexity: {
                        minmi: true,
                        forin: true,
                        logicalor: false
                    }
                },
                files: {
                    'reports': ['katas/**/*.js']
                }
            },
        }, // plato

        mocha_istanbul: {
            coverage: {
                src: 'test/unit',
                options: {
                    check: {
                        lines: 75,
                        statements: 75,
                        branches: 75,
                        functions: 75
                    },
                    mask: '*.js',
                    instrument: ['test'],
                    coverageFolder: "reports/coverage",
                    reporter: "html-cov",
                    ui: 'bdd',
                    root: 'katas/',
                    print: 'summary',
                    excludes: ['node_modules', 'dist']
                }
            }
        }, //mocha_istanbul

        watch: {
            options: {
                livereload: true,
            },
            jshint: {
                files: ['katas/**/*.js', 'test/unit/**/*.js'],
                tasks: ['newer:jshint']
            },
            scripts: {
                files: ['katas/**/*.js'],
                tasks: ['newer:jsbeautifier']
            },
            spec: {
                files: ['katas/**/*.js'],
                tasks: ['copy:spec'],
                options: {
                    event: ['added']
                }
            }
        }, //watch

        concurrent: {
            target1: ['watch'],
            options: {
                logConcurrentOutput: true
            }
        }

    }); //Grunt init



    // Loading dependencies
    for (var key in grunt.file.readJSON("package.json").devDependencies) {
        if (key.indexOf("grunt") === 0 && key !== "grunt") {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('default', ['concurrent:target1'])
    grunt.registerTask('test', ['newer:browserify:test'])
    grunt.registerTask('coverage', ['mocha_istanbul', "plato"])

} //grunt exports
