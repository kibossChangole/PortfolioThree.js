import random
class Environment(object):
    def __init__(self):
        self.location = {'1', '2', '3', '4'}
        self.moves = {'L', 'R', 'U', 'D'}
        self.path = {
            "1L": "W", "1R" : "2", "1U" : "W", "1D" : "3",
            "2L": "1", "2R" : "W", "2U" : "W", "2D" : "4",
            "3L": "W", "3R" : "4", "3U" : "1", "3D" : "W",
            "4L": "3", "4R" : "W", "4U" : "2", "4D" : "W",

        }

        self.journey = []

class Agent(Environment):
    def __init__(self, Environment):
        self.Agentlocation = random.choice(Environment.location)
        print("Agent is in location", self.Agentlocation)
        Environment.Journey.append(self.Agentlocation[0])

        moveagent = self.choosepath(self.Agentlocation, Environment)
        

        
            

    def choosepath (self, Agentlocation, Environment):
        i = random.choice(Environment.moves)
        j = str(Agentlocation[0] + i)
        print("suggested Path", j)

        while(Environment.path[j] == "W"):
         i = random.choice(Environment.moves)
         j = str(Agentlocation[0] + i)
        print("suggested Path", j)



