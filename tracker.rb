#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'
Bundler.require(:default)

@writing_folder = "/home/leonardo/Dropbox/Notes/Escrita"
@snapshot_folder = @writing_folder + "/snapshot"
@log_file = "/home/leonardo/Dropbox/Notes/quantifiedself/writing.csv"

def old_file_path(file)
  inode = File.stat(file).ino
  old_file_name = inode.to_s + ".txt"
  File.join(@snapshot_folder, old_file_name)
end

def count_old_file_words(file)
  begin
    count = WordsCounted.from_file(old_file_path(file)).token_count
  rescue
    count = 0
  end

  count
end

def count_current_file_words(file)
  WordsCounted.from_file(file).token_count
end

def count_word_difference(file)
  count_current_file_words(file) - count_old_file_words(file)
end

def clear_snapshot_folder
  Dir.glob(File.join(@snapshot_folder, "*.{txt,md}")).each do |file|
    File.delete(file)
  end
end

def log_word_count

end

def copy_file_to_snapshot_folder(file)
  FileUtils.cp(file, old_file_path(file))
end

def get_current_files
  files = []
  Dir.glob(@writing_folder + "/*.{txt,md,markdown}").each do |f|
    files << f
  end

  files
end

def count_todays_words
  word_count = 0
  files = get_current_files

  files.each do |file|
    word_count = word_count + count_word_difference(file)
  end

  word_count
end


puts count_todays_words
clear_snapshot_folder

get_current_files.each do |file|
  copy_file_to_snapshot_folder(file)
end

