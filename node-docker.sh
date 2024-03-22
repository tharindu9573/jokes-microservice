#Node
# Use scp inst.sh connor@20.254.68.254:/home/connor
echo "Update linux, install node, npm and mysql"
#All linux installed packages are held in the system are listed in an index file "/etc/apt/sources.list"
# apt (advanced packaging tool) update or apt-get update will update the installed packages list to point to new versions
sudo apt-get update

#install CA certificates and curl app and the gnu version of pgp for secure data transfer
# These will be the latest version given the updated index file from update
sudo apt-get install -y ca-certificates curl gnupg

#Create a dir for the keyring to hold public keys. -p is "don't fail if dit already exists"
sudo mkdir -p /etc/apt/keyrings

#-f fail fast, -s silent, -S show errors even if silent, -L follow redirects
#get the gpg public key for the node source and pipe the key into the keyring. --dearmor converts the ascii key into binary. -o means write to output file
#https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key to have a look at the key
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# set an env var to the version we want. Write the full endpoint including version to stdout and into a file (using tee)
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

#run update again to update the index file with our pointer to node now able to use https as we have the public key
sudo apt-get update

#now we can install node as apt knows where it is and has its public key to use in the secure session
sudo apt-get install nodejs -y

#Docker
#Install docker on Ubuntu
sudo apt update

#install apt-transport to enable apt to access  https based packages - download docker in this case.
#install ca-certificates installs common ca certs
#install curl to be able to download the software
#Install software-properties-common: includes various admin tools including add-apt-repository which enables us to do just 
#that when we want to add a docker repository to the apt package manager - i.e. adds a repo to 
#the list of apt repos already installed by default - i.e. the new repo will be docker so we can download stuff from there
#It also includes apt-key to add a key to the list of gpg keys used to authenticate packages
#You can look at all the keys with apt-key list
sudo apt-get install -y apt-transport-https 
sudo apt-get install -y ca-certificates 
sudo apt-get install -y curl software-properties-common

#Get the docker gpg key then pipe it to apt-key to be added to the keyring
#-f is fail fast with no output. i.e. don't return an error page or anything else
#-s silent. Don't show progress meter or error messages
#-S override the -s and show the error but leave the don't show progress meter set by -s
#-L if a response is a reditrection 3xx then call again with the redirection - i.e. follow the redirrection if resource has moved 
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

#To verify the docker pgp public key has been downloaded and added, check its fingerprint (basically part of the hash 
#of the key) should be, as in docker docs, 0EBFCD88
# The full hash is shown by using the apt-key list:
#pub   rsa4096 2017-02-22 [SCEA]
#      9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
#uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
sudo apt-key fingerprint 0EBFCD88

#Install docker repo in the list of available repos. We want a specific repo at docker, i.e. debian, amd64 bit, linux 
#ubuntu then whatever specific linux code release we are using. $(lsb_release -cs) will get the LSB (Linux Standard Base) 
#code name so we can add it to the repo specificaiton. e.g. try: echo $(lsb_release -c) and it will output the release 
#code, in my case Codename: focal.  To limit it to just focal, use -cs i.e. add the s for "short" codename. Then add 
#stable so we point to the latest stable release repo for docker. There are other options for this command. See 
#https://linux.die.net/man/1/lsb_release  e.g. -cr for release number as well as codename of this release. -a gives you 
#everything. e.g.in my case: Distributor ID: Ubuntu Description: Ubuntu 20.04.6 LTS Release: 20.04 Codename: focal
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

#Install docker
#-ce is the free community edition. -ee is enterprise edition which is not free
sudo apt-get install -y docker-ce

#Test with docker -v

#We have to use sudo for all subsequent docker commands to avoid this by adding the vm user int a group with docker. 
#To add user to a group called docker:
#Groups are added to the group file at /etc so could have checked to see that docker was already there
sudo groupadd docker  #this may already exist. Each user can be a member of one primary group and any number of secondary

#To add users to a group, use usermod and --append --groups (or -a -G, or -aG)
#Add me (vm user name) to the docker group
sudo usermod -aG docker OsAdmin

#To make this work, the vm may need to be restarted but try the following first:
newgrp docker # Should now be able to use all docker commands without psudo as the new group is logged in, i.e. docker and me
