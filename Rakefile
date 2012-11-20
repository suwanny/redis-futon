require 'rake'
require 'rake/clean'
require 'fileutils'

# Defines
Home = Rake.original_dir

ClobberList = [
  "#{Home}/*.deb",
  "#{Home}/lib/*.js"
]

@tasks_help = []
def hdoc command, desc
  @tasks_help << [command, desc]
end

CoffeeBin = "node_modules/.bin/coffee"
JasminBin = "node_modules/.bin/jasmine-node"
Compressor= "node_modules/.bin/uglifyjs"

CLOBBER.include(ClobberList)

task :default => [:help]

task :help do
  @tasks_help.each do |task|
    if task[1].size > 0
      output = "  rake %-20s: %s" % [task[0], task[1]]
    else
      output = "\n+ %-30s %s\n\n" % [task[0], '*'*60 ]
    end
    puts output
  end
end

hdoc 'init', 'npm install: download all dependencies.'
task :init do
  sh "npm install"
end

hdoc'compile', 'compile coffee-script codes to javascript.'
task :compile => [:init, :clobber] do
  sh "rm -rf lib/*"
  sh "#{CoffeeBin} -o lib/ -cb src/"
end

hdoc 'spec', 'run jasmin spec unit tests'
task :spec => [:compile] do
  sh "#{JasminBin} --verbose --forceexit spec/"
end

hdoc 'compress', 'compress javascript files'
task :compress => [:compile] do
  Dir.glob("{lib}/**/*").each { |filename|
    next if File.directory? (filename)
    sh "#{Compressor} --overwrite #{filename}"
  }
end

hdoc 'run', 'run main coffee'
task :run => [:compile] do
  sh "#{CoffeeBin} src/main.coffee"
end

hdoc 'run_js', 'run main js'
task :run_js do
  sh "node lib/main.js"
end

hdoc 'run_debug', 'run main js with debug mode'
task :run_debug => [:compile] do
  sh "node --debug lib/main.js"
end


